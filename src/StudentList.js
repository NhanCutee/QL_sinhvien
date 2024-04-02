// src/StudentList.js
import React from 'react';

function StudentList({ students }) {
  return (
    <div>
      <h2>Danh sách sinh viên</h2>
      <ul>
        {students.map((student, index) => (
          <li key={index}>{student}</li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
