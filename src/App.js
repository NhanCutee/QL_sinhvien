import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Select, MenuItem, Button, TextField } from '@mui/material';
import * as XLSX from 'xlsx';

function SubjectDetail() {
  const [students, setStudents] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mssv: '',
    grade: ''
  });

  const { subjectId } = useParams();

  useEffect(() => {
    if (subjectId) {
      fetchData(subjectId);
    }
  }, [subjectId]);

  const fetchData = async (subjectId) => {
    try {
      const response = await fetch(`http://localhost:4000/sinhvien/subject/${subjectId}`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ URL.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (studentId, studentData) => {
    setEditingStudentId(studentId);
    setEditFormData(studentData);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleEdit(editingStudentId, editFormData); 
      setEditingStudentId(null);
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleEdit = async (studentId, updatedStudentData) => {
    try {
      const response = await fetch(`http://localhost:4000/sinhvien/update/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStudentData)
      });
      if (response.ok) {
        console.log(`Updated student with ID: ${studentId}`);
        setStudents(prevStudents => prevStudents.map(student => {
          if (student.mssv === studentId) {
            return { ...student, ...updatedStudentData };
          }
          return student;
        }));
      } else {
        console.error('Có lỗi xảy ra khi cập nhật sinh viên.');
      }
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:4000/sinhvien/delete/${studentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log(`Deleted student with ID: ${studentId}`);
        setStudents(prevStudents => prevStudents.filter(student => student.mssv !== studentId));
      } else {
        console.error('Có lỗi xảy ra khi xóa sinh viên.');
      }
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    }
  };

  if (students.length === 0) {
    return <Typography variant="h5" align="center">Không tìm thấy dữ liệu cho môn học này.</Typography>;
  }

  return (
    <div>
      <Typography variant="h5" align="center">Danh sách sinh viên</Typography>
      <Grid container spacing={3}>
        {students.map(student => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={student.mssv}>
            <Paper elevation={3} style={{ padding: 20 }}>
              <Typography variant="subtitle1">{student.name}</Typography>
              <Typography variant="body2">MSSV: {student.mssv}</Typography>
              <Typography variant="body2">Grade: {student.grade}</Typography>
              <Button onClick={() => handleEditClick(student.mssv, student)}>Edit</Button>
              <Button onClick={() => handleDelete(student.mssv)}>Delete</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {editingStudentId && (
        <div style={{ marginTop: 20 }}>
          <Typography variant="h6" align="center">Chỉnh sửa sinh viên</Typography>
          <form onSubmit={handleEditSubmit}>
            <TextField
              label="Tên"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
            />
            <TextField
              label="MSSV"
              name="mssv"
              value={editFormData.mssv}
              onChange={handleEditChange}
            />
            <TextField
              label="Grade"
              name="grade"
              value={editFormData.grade}
              onChange={handleEditChange}
            />
            <Button type="submit">Save</Button>
          </form>
        </div>
      )}
    </div>
  );
}

function App() {
  const [subjectsData, setSubjectsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:4000/subject');
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ URL.');
      }
      const data = await response.json();
      setSubjectsData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          console.log('Dữ liệu từ file đã được đọc thành công.');
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Dữ liệu sinh viên từ file Excel:', jsonData);
  
          formData.append('students', JSON.stringify(jsonData));
  
          try {
            console.log('Dữ liệu và file được gửi đi:', formData);
            const response = await fetch('http://localhost:4000/uploadfile', {
              method: 'POST',
              body: formData,
            });
            if (response.ok) {
              const responseData = await response.text();
              console.log('Response từ máy chủ:', responseData);
            } else {
              const errorResponse = await response.text();
              console.error('Có lỗi xảy ra khi gửi dữ liệu và file:', errorResponse);
            }
          } catch (error) {
            console.error('Đã có lỗi xảy ra khi gửi dữ liệu và file:', error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Không có file được chọn.');
      }
    };
    fileInput.click();
  };
  
  return (
    <Router>
      <Container maxWidth="lg" style={{ marginTop: 20 }}>
        <Typography variant="h3" align="center" gutterBottom>Quản lý sinh viên</Typography>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Paper elevation={3} style={{ padding: 20, minHeight: '400px' }}>
              <Typography variant="h5" align="center">Danh sách môn học</Typography>
              <Select fullWidth label="Chọn môn học">
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {subjectsData.map(subject => (
                  <MenuItem key={subject.id_subject} component={Link} to={`/${subject.id_subject}`} value={subject.id_subject}>
                    {subject.name_subject}
                  </MenuItem>
                ))}
              </Select>
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <Paper elevation={3} style={{ padding: 20, minHeight: '400px' }}>
              <Routes>
                <Route path="/" element={<Typography variant="h5" align="center">Vui lòng chọn một môn học để xem danh sách sinh viên.</Typography>} />
                <Route path="/:subjectId" element={<SubjectDetail />} />
              </Routes>
            </Paper>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleUpload}>
              Thêm dữ liệu
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Router>
  );
}

export default App;
