const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static frontend (your index.html and assets inside 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));

// Email Transporter Setup (Using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error.message);
    } else {
        console.log('✅ Server is ready to take our messages');
    }
});

// POST Route: Handle Contact Form Submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Please provide name, email, and message.' 
        });
    }

    const mailOptions = {
        from: `"${name} (Portfolio Contact)" <${process.env.EMAIL_USER}>`,
        to: process.env.RECEIVER_EMAIL,
        replyTo: email,
        subject: `🚀 New Portfolio Message from ${name}`,
        text: `You have received a new message from your portfolio website:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #0f172a; color: #f8fafc;">
                <h2 style="color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 10px;">New Contact Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
                <div style="margin-top: 20px; padding: 15px; background-color: #1e293b; border-left: 4px solid #38bdf8; border-radius: 4px;">
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📨 Message sent successfully from ${email}`);
        res.status(200).json({ 
            success: true, 
            message: 'Message transmitted successfully! I will get back to you soon.' 
        });
    } catch (error) {
        console.error('❌ Email Send Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send message. Please try again later.' 
        });
    }
});

// Fallback route (Express 5.x Compatible): Send index.html for any other requests
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// START SERVER (Ye line miss ho gayi thi!)
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 System Online: Server running on http://localhost:${PORT}`);
});