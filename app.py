from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# DB 경로
DB_PATH = 'inquiries.db'

def init_db():
    """데이터베이스 초기화"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            business_type TEXT,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending'
        )
    ''')
    conn.commit()
    conn.close()

def get_db():
    """DB 연결"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/inquiry', methods=['POST'])
def create_inquiry():
    """문의 접수 API"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        if not data.get('name'):
            return jsonify({'error': '이름을 입력해주세요.'}), 400
        if not data.get('phone'):
            return jsonify({'error': '연락처를 입력해주세요.'}), 400
        
        # 전화번호 형식 간단 검증
        phone = data.get('phone', '').replace('-', '').replace(' ', '')
        if len(phone) < 10:
            return jsonify({'error': '올바른 연락처를 입력해주세요.'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO inquiries (name, phone, email, business_type, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('phone'),
            data.get('email', ''),
            data.get('business_type', ''),
            data.get('message', ''),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        inquiry_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '문의가 성공적으로 접수되었습니다.',
            'inquiry_id': inquiry_id
        }), 201
        
    except Exception as e:
        print(f"Error creating inquiry: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/inquiries', methods=['GET'])
def get_inquiries():
    """문의 목록 조회 API (관리자용)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 쿼리 파라미터
        status = request.args.get('status')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        query = 'SELECT * FROM inquiries'
        params = []
        
        if status:
            query += ' WHERE status = ?'
            params.append(status)
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        inquiries = []
        for row in rows:
            inquiries.append({
                'id': row['id'],
                'name': row['name'],
                'phone': row['phone'],
                'email': row['email'],
                'business_type': row['business_type'],
                'message': row['message'],
                'created_at': row['created_at'],
                'status': row['status']
            })
        
        # 총 개수
        cursor.execute('SELECT COUNT(*) FROM inquiries')
        total = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'inquiries': inquiries,
            'total': total,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        print(f"Error fetching inquiries: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/inquiries/<int:inquiry_id>', methods=['GET'])
def get_inquiry(inquiry_id):
    """문의 상세 조회 API"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM inquiries WHERE id = ?', (inquiry_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if not row:
            return jsonify({'error': '문의를 찾을 수 없습니다.'}), 404
        
        return jsonify({
            'id': row['id'],
            'name': row['name'],
            'phone': row['phone'],
            'email': row['email'],
            'business_type': row['business_type'],
            'message': row['message'],
            'created_at': row['created_at'],
            'status': row['status']
        })
        
    except Exception as e:
        print(f"Error fetching inquiry: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/inquiries/<int:inquiry_id>/status', methods=['PATCH'])
def update_inquiry_status(inquiry_id):
    """문의 상태 변경 API (관리자용)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'contacted', 'completed', 'cancelled']:
            return jsonify({'error': '올바른 상태값이 아닙니다.'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE inquiries SET status = ? WHERE id = ?
        ''', (new_status, inquiry_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': '문의를 찾을 수 없습니다.'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '상태가 변경되었습니다.'
        })
        
    except Exception as e:
        print(f"Error updating inquiry status: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/inquiries/<int:inquiry_id>', methods=['DELETE'])
def delete_inquiry(inquiry_id):
    """문의 삭제 API (관리자용)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM inquiries WHERE id = ?', (inquiry_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': '문의를 찾을 수 없습니다.'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': '문의가 삭제되었습니다.'
        })
        
    except Exception as e:
        print(f"Error deleting inquiry: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """문의 통계 API (관리자용)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 전체 문의 수
        cursor.execute('SELECT COUNT(*) FROM inquiries')
        total = cursor.fetchone()[0]
        
        # 상태별 문의 수
        cursor.execute('''
            SELECT status, COUNT(*) as count 
            FROM inquiries 
            GROUP BY status
        ''')
        status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
        
        # 오늘 문의 수
        cursor.execute('''
            SELECT COUNT(*) FROM inquiries 
            WHERE DATE(created_at) = DATE('now')
        ''')
        today = cursor.fetchone()[0]
        
        # 이번 주 문의 수
        cursor.execute('''
            SELECT COUNT(*) FROM inquiries 
            WHERE created_at >= DATE('now', '-7 days')
        ''')
        this_week = cursor.fetchone()[0]
        
        # 업종별 문의 수
        cursor.execute('''
            SELECT business_type, COUNT(*) as count 
            FROM inquiries 
            WHERE business_type != ''
            GROUP BY business_type
            ORDER BY count DESC
        ''')
        business_types = {row['business_type']: row['count'] for row in cursor.fetchall()}
        
        conn.close()
        
        return jsonify({
            'total': total,
            'today': today,
            'this_week': this_week,
            'by_status': status_counts,
            'by_business_type': business_types
        })
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500


# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
