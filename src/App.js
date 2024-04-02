import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Select, MenuItem, List, ListItem, ListItemText, Button } from '@mui/material';
import { read, utils } from 'xlsx'; 

function SubjectDetail() {
  const [students, setStudents] = useState([]);
  const { subjectId } = useParams();

  useEffect(() => {
    if (subjectId) {
      fetchData(subjectId);
    }
  }, [subjectId]);

  const fetchData = async (subjectId) => {
    try {
      const response = await fetch(`https://xdwebserver.onrender.com/sinhvien/subject/${subjectId}`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu từ URL.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (studentId) => {
    // Xử lý sự kiện edit sinh viên với id là studentId
    console.log('Edit student:', studentId);
  };

  const handleDelete = async (studentId) => {
    try {
      const response = await fetch(`https://xdwebserver.onrender.com/sinhvien/delete/${studentId}`, {
        method: 'POST',
      });
      if (response.ok) {
        console.log(`Deleted student with ID: ${studentId}`);
        // Sau khi xóa thành công, cần cập nhật lại danh sách sinh viên
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
      <Typography variant="h5" align="center">Danh sách sinh viên </Typography>
      <List>
        {students.map(student => (
          <ListItem key={student.mssv}>
            <ListItemText primary={student.name} secondary={`MSSV: ${student.mssv}`} />
            <Button onClick={() => handleEdit(student.mssv)}>Edit</Button>
            <Button onClick={() => handleDelete(student.mssv)}>Delete</Button>
          </ListItem>
        ))}
      </List>
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
      const response = await fetch('https://xdwebserver.onrender.com/subject');
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

    // Xử lý sự kiện khi người dùng chọn file
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet);

          // Gửi dữ liệu JSON qua API
          try {
            const response = await fetch('https://xdwebserver.onrender.com/sinhvien', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(jsonData)
            });
            if (response.ok) {
              console.log('Dữ liệu đã được gửi thành công.');
            } else {
              console.error('Có lỗi xảy ra khi gửi dữ liệu.');
            }
          } catch (error) {
            console.error('Đã có lỗi xảy ra:', error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Không có file được chọn.');
      }
    };


    // Mô phỏng sự kiện click vào thẻ input
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
