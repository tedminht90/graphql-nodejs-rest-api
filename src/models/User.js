// Mock database - trong thực tế sẽ là MongoDB, PostgreSQL, etc.
let users = [
  { id: 1, name: 'Trần Vân Anh', email: 'nguyenvana@gmail.com', age: 25 },
  { id: 2, name: 'Trần Linh Anh', email: 'tranthib@yahoo.com', age: 30 },
  { id: 3, name: 'Trần Thị An', email: 'levanc@gmail.com', age: 28 },
  { id: 4, name: 'Nguyễn Minh Anh', email: 'phamthid@hotmail.com', age: 22 },
  { id: 5, name: 'Trần Linh Bình', email: 'hoangvane@gmail.com', age: 35 },
  { id: 6, name: 'Trần Vân Ánh', email: 'nguyenvana@gmail.com', age: 25 },
  { id: 7, name: 'Tạ Ngọc Linh An', email: 'hoangvane@gmail.com', age: 7 }
];

let nextId = 8;

class User {
  // Lấy tất cả users
  static getAll() {
    return users;
  }

  // Lấy user theo ID
  static getById(id) {
    return users.find(user => user.id === parseInt(id));
  }

  // Lấy user theo email
  static getByEmail(email) {
    return users.find(user => user.email === email);
  }

  // Tạo user mới
  static create(userData) {
    const newUser = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      age: parseInt(userData.age)
    };
    
    users.push(newUser);
    return newUser;
  }

  // Cập nhật user
  static update(id, userData) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      return null;
    }

    // Cập nhật chỉ các field được cung cấp
    if (userData.name !== undefined) {
      users[userIndex].name = userData.name;
    }
    if (userData.email !== undefined) {
      users[userIndex].email = userData.email;
    }
    if (userData.age !== undefined) {
      users[userIndex].age = parseInt(userData.age);
    }

    return users[userIndex];
  }

  // Xóa user
  static delete(id) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      return null;
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    return deletedUser;
  }

  // Validation methods
  static validateUserData(userData, isUpdate = false) {
    const errors = [];

    // Kiểm tra required fields (chỉ khi tạo mới)
    if (!isUpdate) {
      if (!userData.name || userData.name.trim() === '') {
        errors.push('Tên không được để trống');
      }
      if (!userData.email || userData.email.trim() === '') {
        errors.push('Email không được để trống');
      }
      if (!userData.age) {
        errors.push('Tuổi không được để trống');
      }
    }

    // Validate email format
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Email không đúng định dạng');
      }
    }

    // Validate age
    if (userData.age) {
      const age = parseInt(userData.age);
      if (isNaN(age) || age < 1 || age > 150) {
        errors.push('Tuổi phải là số từ 1 đến 150');
      }
    }

    // Validate name length
    if (userData.name && userData.name.trim().length < 2) {
      errors.push('Tên phải có ít nhất 2 ký tự');
    }

    return errors;
  }

  // Kiểm tra email đã tồn tại (trừ user hiện tại khi update)
  static isEmailExists(email, excludeId = null) {
    return users.some(user => 
      user.email === email && (excludeId === null || user.id !== parseInt(excludeId))
    );
  }
}

module.exports = User;