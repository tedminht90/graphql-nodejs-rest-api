const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Get all users successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', UserController.getAllUsers);

/**
 * @swagger
 * /api/users/uid/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/uid/:id', UserController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', UserController.createUser);

/**
 * @swagger
 * /api/users/search:
 *   post:
 *     summary: Search users with simple criteria
 *     tags: [Users]
 *     description: Search users by email, name, or age. Recommended for production use.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchQuery'
 *           examples:
 *             searchByEmail:
 *               summary: Search by email
 *               value:
 *                 email: "nguyenvana@email.com"
 *             searchByName:
 *               summary: Search by name (partial match)
 *               value:
 *                 name: "Nguyễn"
 *             searchByAge:
 *               summary: Search by age
 *               value:
 *                 age: 25
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tìm kiếm thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       404:
 *         description: No user found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoDataFoundResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/search', UserController.searchUsers);

/**
 * @swagger
 * /api/users/query:
 *   post:
 *     summary: Advanced GraphQL-style query
 *     tags: [Users]
 *     description: |
 *       Powerful querying with filtering, sorting, field selection, and pagination.
 *       
 *       **Vietnamese Name Sorting:**
 *       When sorting by 'name' field, the API uses intelligent Vietnamese name sorting:
 *       1. **Tên chính (Given Name)** - Primary sort criteria
 *       2. **Họ (Family Name)** - Secondary criteria  
 *       3. **Tên đệm (Middle Name)** - Final tiebreaker
 *       
 *       **Supported Operators:**
 *       - **email.equals**: Exact email match
 *       - **email.contains**: Email contains substring
 *       - **age.gt**: Age greater than
 *       - **age.lt**: Age less than
 *       - **age.equals**: Exact age match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvancedQuery'
 *           examples:
 *             filterByEmailDomain:
 *               summary: Find Gmail users
 *               value:
 *                 where:
 *                   email:
 *                     contains: "@gmail.com"
 *             ageRangeWithFields:
 *               summary: Age range with specific fields
 *               value:
 *                 where:
 *                   age:
 *                     gt: 25
 *                     lt: 35
 *                 select: ["name", "age"]
 *                 sort:
 *                   field: "age"
 *                   direction: "asc"
 *             vietnameseNameSort:
 *               summary: Vietnamese name sorting
 *               value:
 *                 sort:
 *                   field: "name"
 *                   direction: "asc"
 *                 select: ["name"]
 *             complexQuery:
 *               summary: Complex multi-condition query
 *               value:
 *                 where:
 *                   age:
 *                     gt: 20
 *                   email:
 *                     contains: "@gmail.com"
 *                 select: ["name", "email"]
 *                 sort:
 *                   field: "name"
 *                   direction: "asc"
 *                 limit: 3
 *     responses:
 *       200:
 *         description: Query results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Query thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/query', UserController.queryUsers);

/**
 * @swagger
 * /api/users/uid/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/uid/:id', UserController.updateUser);

/**
 * @swagger
 * /api/users/uid/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/uid/:id', UserController.deleteUser);

module.exports = router;