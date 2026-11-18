const db = require('../config/db');

const Patient = {
    async create(name, email, phone) {
        const query = 'INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)';
        const [result] = await db.execute(query, [name, email, phone]);
        return result.insertId;
    },

    async findAll() {
        const [rows] = await db.execute('SELECT * FROM patients');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [id]);
        return rows[0];
    },

    async update(id, name, email, phone) {
        const query = 'UPDATE patients SET name = ?, email = ?, phone = ? WHERE patient_id = ?';
        const [result] = await db.execute(query, [name, email, phone, id]);
        return result.affectedRows;
    },

    async remove(id) {
        const [result] = await db.execute('DELETE FROM patients WHERE patient_id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Patient;