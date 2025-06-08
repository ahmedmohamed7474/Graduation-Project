const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
    async register(req, res) {
        try {
            const { name, email, password, roleId } = req.body;
            
            // Check if user already exists
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'البريد الإلكتروني مسجل مسبقاً' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await userRepository.create({
                name,
                email,
                password: hashedPassword,
                roleId
            });

            // Generate token
            const token = jwt.sign(
                { userId: user.id, role: user.role.name },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'تم إنشاء الحساب بنجاح',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await userRepository.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid login credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid login credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, role: user.role.name },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role // Send the full role object
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await userRepository.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'المستخدم غير موجود' });
            }

            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المستخدم', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, email, password } = req.body;
            const userId = req.user.userId;

            let updateData = { name, email };

            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const user = await userRepository.update(userId, updateData);

            res.json({
                message: 'تم تحديث البيانات بنجاح',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث البيانات', error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userRepository.findAll();
            res.json(users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            })));
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب قائمة المستخدمين', error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userRepository.delete(parseInt(id));
            res.json({ message: 'تم حذف المستخدم بنجاح' });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء حذف المستخدم', error: error.message });
        }
    }
}

module.exports = new UserController();