// StudentPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import StudentList from './StudentList';
import classesData from './data';

const StudentPage = () => {
  const { classId } = useParams();
  const selectedClass = classesData.find(classItem => classItem.id === parseInt(classId));

  return (
    <div>
      <h2>Danh sách sinh viên của lớp {selectedClass.name}</h2>
      <StudentList students={selectedClass.students} />
    </div>
  );
}

export default StudentPage;
