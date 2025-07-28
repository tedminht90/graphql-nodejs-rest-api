const User = require('../models/User');

class UserController {
  // GET /api/users - Lấy tất cả users
  static getAllUsers(req, res) {
    try {
      const users = User.getAll();
      
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách users thành công',
        data: users,
        total: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // GET /api/users/:id - Lấy user theo ID
  static getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = User.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin user thành công',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // POST /api/users/search - Tìm user theo criteria
  static searchUsers(req, res) {
    try {
      const {email, name, age} = req.body;

      if (!email && !name && !age) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ít nhất một tiêu chí tìm kiếm'
        });
      }
      
      let users = User.getAll();

      // Filter by Email
      if (email) {
        users = users.filter(user => user.email.toLowerCase() === email.toLowerCase());
      }

      // Filter by Name
      if (name) {
        users = users.filter(user => user.name.toLowerCase() === name.toLowerCase());
      }

      // Filter by Age
      if (age) {
        users = users.filter(user => user.age === age);
      }

      res.status(200).json({
        success: true,
        message: 'Tìm kiếm users thành công',
        data: users,
        total: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      }); 
    }
  }

  // ### Query Structure
  // {
  //   "where": {          // Filter conditions
  //     "email": {
  //       "equals": "...",     // Exact match
  //       "contains": "..."    // Substring search
  //     },
  //     "age": {
  //       "gt": 20,           // Greater than
  //       "lt": 30,           // Less than
  //       "equals": 25        // Exact match
  //     }
  //   },
  //
  //   "select": ["id", "name", "email"],  // Select specific fields
  //
  //   "sort": {                           // Sort results
  //     "field": "age",
  //     "direction": "desc"               // "asc" or "desc"
  //   },
  //
  //   "limit": 10                         // Limit number of results
  // }
  //

  // POST /api/users/query
  static queryUsers(req, res) {
    try {
      const {where, select, limit = 10, sort} = req.body;

      // Get all users
      let users = User.getAll();

      // Apply WHERE conditions
      if (where) {
        if (where.email) { // nếu có điều kiện email
          users = users.filter(user => {
            if (where.email.equals) { // Tìm chính xác địa chỉ email
              return user.email === where.email.equals; 
            }
            // Ví dụ
            // {
            //   "where": {
            //     "email": { "equals": "phamthid@hotmail.com" }
            //   }
            // }
            if (where.email.contains) { // Tìm chuỗi chứa ký tự
            // Ví dụ
            // {
            //   "where": {
            //     "email": { "contains": "@gmail.com" }
            //   }
            // }
              return user.email.includes(where.email.contains);
            }
            return true;
          });
        }

        if (where.age) {
          users = users.filter(user => {
            // Ví dụ
            // {
            //   "where": {
            //    "age": { "gt": 25, "lt": 35 }
            // }
            if (where.age.gt) return user.age > where.age.gt; // Greater than
            if (where.age.lt) return user.age < where.age.lt; // Less than
            // Ví dụ
            // {
            //   "where": {
            //    "age": { "equals": 30 }
            // }
            if (where.age.equals) return user.age === where.age.equals; // Tìm chính xác
            return true;
          });
        }
      }
      // Apply SORT
      if (sort) { // true, nếu có điều kiện sort
        users.sort((a, b) => {
          // Ví dụ 1:
          // {
          //     "where": {},
          //     "sort": {
          //         "field": "age",
          //         "direction": "asc"
          //     },
          //     "select": [
          //         "name",
          //         "age"
          //     ]
          // }
          // Ví dụ 2:
          // {
          //     "where": {},
          //     "sort": {
          //         "field": "name",
          //         "direction": "asc"
          //     },
          //     "select": [
          //         "name",
          //         "age"
          //     ]
          // }
          const field = sort.field || 'id'; // tên field muốn sort (vd: 'name', 'age', 'email') mặc định là id
          const direction = sort.direction === 'desc' ? -1 : 1; // Multiplier để đảo ngược kết quả sort, 'desc' → -1 (descending), Anything else → 1 (ascending)


          // a và b: Hai user objects đang được so sánh
          // a[field]: Dynamic property access
          // Lấy giá trị của field cụ thể từ mỗi user
          let valueA = a[field];
          let valueB = b[field];

          // Handle null/undefined values
          if (valueA == null && valueB == null) return 0; // Cả 2 giá trị đều null/undefined, coi như bằng nhau

          // return 1 * direction valueA đứng sau valueB
          // Ascending (direction = 1): return 1 → A sau B → [B, A]
          // Descending (direction = -1): return -1 → A trước B → [A, B]
          // Quy tắc: null values xuống cuối trong ascending, lên đầu trong descending
          if (valueA == null) return 1 * direction;

          // return -1 * direction valueA đứng trước valueB
          // Ascending (direction = 1): return -1 → A trước B → [A, B]
          // Descending (direction = -1): return 1 → A sau B → [B, A]
          // Quy tắc: null values xuống cuối trong ascending, lên đầu trong descending
          if (valueB == null) return -1 * direction;


          // Điều kiện 1: field === 'name' → Chỉ áp dụng khi sort theo name
          // Điều kiện 2: typeof valueA === 'string' → valueA phải là string
          // Điều kiện 3: typeof valueB === 'string' → valueB phải là string
          // Tất cả 3 điều kiện đều true → Dùng compareFullName() function
          if (field === 'name' && typeof valueA === 'string' && typeof valueB === 'string') {
            // * direction: Áp dụng ascending/descending
            return compareFullName(valueA, valueB) * direction;
          }

          // Áp dụng cho: Các string field khác ngoài 'name' (email, address, etc.)
          // .toLowerCase(): Convert về lowercase để so sánh case-insensitive
          // .localeCompare(): So sánh string theo locale (Unicode-aware)
          // * direction: Áp dụng ascending/descending
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return valueA.toLowerCase().localeCompare(valueB.toLowerCase()) * direction;
          }

          // Áp dụng cho: Numeric fields (age, id, salary, etc.)
          // (valueA - valueB): Subtraction comparison
          // Result < 0: valueA < valueB
          // Result > 0: valueA > valueB
          // Result = 0: valueA = valueB
          // * direction: Áp dụng ascending/descending
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return (valueA - valueB) * direction;
          }

          // Khi nào dùng: Khi không match case nào ở trên
          // String(value): Convert bất kỳ type nào thành string
          // localeCompare(): So sánh như string thông thường
          return String(valueA).localeCompare(String(valueB)) * direction;
        });
      }
      // Apply LIMIT
      // Nếu limit không phải là số, sẽ mặc định là 10
      users = users.slice(0, parseInt(limit));

      // Apply SELECT (only return specified fields)
      if (select && Array.isArray(select)) {
        // map() tạo một array mới bằng cách transform từng element
        // Mỗi user object sẽ được chuyển thành selectedUser object mới
        // Không modify array gốc, tạo array hoàn toàn mới
        users = users.map(user => { 
          // Tạo object rỗng để chứa các fields được chọn
          // Mỗi user sẽ có một selectedUser riêng
          // object này sẽ chỉ chứa các fields được chọn
          const selectedUser = {};
          select.forEach(field => {
            // Lặp qua từng field name trong mảng select array
            // field là string tên field(ví dụ: "id", "name", "email")
            if (user[field] !== undefined) {
              selectedUser[field] = user[field];
            }
            // user[field]: Truy cập dynamic property của object
            //!== undefined: Kiểm tra field có tồn tại trong user object không
            // selectedUser[field] = user[field]: Copy giá trị từ user gốc
          });
          // Trả về object mới chỉ chứa các fields được chọn
          // Object này sẽ thay thế user gốc trong array kết quả
          return selectedUser;
        });
      }
      // Return response
      res.status(200).json({
        success: true,
        message: 'Query successful',
        data: users,
        total: users.length
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error server',
        error: error.message
      });
    }
  }

  // POST /api/users - Tạo user mới
  static createUser(req, res) {
    try {
      const userData = req.body;

      // Validation
      const validationErrors = User.validateUserData(userData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          errors: validationErrors
        });
      }

      // Kiểm tra email đã tồn tại
      if (User.isEmailExists(userData.email)) {
        return res.status(409).json({
          success: false,
          message: 'Email used by another user'
        });
      }
      
      const newUser = User.create(userData);
      
      res.status(201).json({
        success: true,
        message: 'Create user successful',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error server',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id - Cập nhật user
  static updateUser(req, res) {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Kiểm tra user có tồn tại không
      const existingUser = User.getById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Validation cho update
      const validationErrors = User.validateUserData(userData, true);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          errors: validationErrors
        });
      }
      
      // Kiểm tra email trùng với user khác
      if (userData.email && User.isEmailExists(userData.email, userId)) {
        return res.status(409).json({
          success: false,
          message: 'Email used by another user'
        });
      }
      
      const updatedUser = User.update(userId, userData);
      
      res.status(200).json({
        success: true,
        message: 'Update user successful',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error server',
        error: error.message
      });
    }
  }

  // DELETE /api/users/:id - Xóa user
  static deleteUser(req, res) {
    try {
      const userId = req.params.id;
      
      const deletedUser = User.delete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Xóa user thành công',
        data: deletedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
}

// Helper function for full name comparison
function compareFullName(nameA, nameB) {
  const partsA = nameA.trim().split(/\s+/);
  const partsB = nameB.trim().split(/\s+/);
  
  // Extract components
  const getNameComponents = (parts) => {
    return {
      firstName: parts[0] || '',                    // Họ (first part)
      lastName: parts[parts.length - 1] || '',     // Tên chính (last part)
      middleName: parts.slice(1, -1).join(' ') || '' // Tên đệm (middle parts)
    };
  };
  
  const componentA = getNameComponents(partsA);
  const componentB = getNameComponents(partsB);
  
  // Priority 1: Compare TÊN CHÍNH (lastName) first
  const lastNameComparison = componentA.lastName.toLowerCase().localeCompare(
    componentB.lastName.toLowerCase(), 
    'vi', 
    { sensitivity: 'base' }
  );
  
  if (lastNameComparison !== 0) {
    return lastNameComparison;
  }
  
  // Priority 2: If TÊN CHÍNH same, compare HỌ (firstName)
  const firstNameComparison = componentA.firstName.toLowerCase().localeCompare(
    componentB.firstName.toLowerCase(), 
    'vi', 
    { sensitivity: 'base' }
  );
  
  if (firstNameComparison !== 0) {
    return firstNameComparison;
  }
  
  // Priority 3: If both same, compare TÊN ĐỆM (middleName)
  const middleNameComparison = componentA.middleName.toLowerCase().localeCompare(
    componentB.middleName.toLowerCase(), 
    'vi', 
    { sensitivity: 'base' }
  );
  
  return middleNameComparison;
}

module.exports = UserController;