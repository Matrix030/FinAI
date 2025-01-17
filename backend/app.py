from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app)

# Configure PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:rishi@localhost/finance_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define a model for income and expenses
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)  # 'income' or 'expense'
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    date = db.Column(db.Date, default=datetime.utcnow)  # Add this line
# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return jsonify(message="Welcome to the AI Financial Platform!", status="success")

# API to add a transaction
@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.json
    new_transaction = Transaction(
    type=data['type'],
    amount=data['amount'],
    description=data.get('description', ''),
    date=datetime.strptime(data['date'], "%Y-%m-%d") if 'date' in data else datetime.utcnow()
)
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify(message="Transaction added successfully!", status="success")

# API to get all transactions
@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    result = [
        {
            'id': t.id,
            'type': t.type,
            'amount': t.amount,
            'description': t.description,
            'date': t.date.strftime('%Y-%m-%d')  # Format the date as a string
        }
        for t in transactions
    ]
    return jsonify(transactions=result, status="success")

if __name__ == "__main__":
    app.run(debug=True)
