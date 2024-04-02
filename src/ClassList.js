// ClassList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';
import classesData from './data';

const ClassList = () => {
  return (
    <List component="nav">
      {classesData.map(classItem => (
        <ListItem button key={classItem.id} component={Link} to={`/class/${classItem.id}`}> {/* Chuyển hướng đến trang danh sách sinh viên khi nhấp vào lớp */}
          <ListItemText primary={classItem.name} />
        </ListItem>
      ))}
    </List>
  );
}

export default ClassList;
