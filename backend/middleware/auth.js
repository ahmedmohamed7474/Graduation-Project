const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // استخراج التوكن من الهيدر
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
        }

        // التحقق من صحة التوكن
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // إضافة معلومات المستخدم إلى الطلب
        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
        }
        res.status(401).json({ message: 'غير مصرح لك بالوصول' });
    }
}; 