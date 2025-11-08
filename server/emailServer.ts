// server/emailServer.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // PDF 파일이 클 수 있으므로 limit 증가

/**
 * 이메일 설정 인터페이스
 */
interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

/**
 * 이메일 전송 요청 인터페이스
 */
interface SendEmailRequest {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: string; // Base64 encoded
        encoding: string;
    }>;
    emailConfig?: EmailConfig;
}

/**
 * 기본 이메일 설정 (환경변수에서 로드)
 */
const getDefaultEmailConfig = (): EmailConfig => {
    return {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        }
    };
};

/**
 * 이메일 전송 API 엔드포인트
 */
app.post('/api/send-email', async (req: Request, res: Response) => {
    try {
        const { to, subject, html, text, attachments, emailConfig }: SendEmailRequest = req.body;

        // 필수 필드 검증
        if (!to || !subject || !html) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, html'
            });
        }

        // 이메일 설정 (사용자 제공 또는 기본값)
        const config = emailConfig || getDefaultEmailConfig();

        // 이메일 설정이 완료되지 않은 경우
        if (!config.auth.user || !config.auth.pass) {
            return res.status(400).json({
                success: false,
                message: 'Email configuration is not set. Please provide email credentials.'
            });
        }

        // Nodemailer transporter 생성
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            }
        });

        // 첨부파일 처리
        const processedAttachments = attachments?.map((att) => ({
            filename: att.filename,
            content: Buffer.from(att.content, 'base64'),
            encoding: att.encoding as BufferEncoding
        }));

        // 이메일 전송
        const info = await transporter.sendMail({
            from: config.auth.user,
            to,
            subject,
            text: text || 'Portfolio Report',
            html,
            attachments: processedAttachments
        });

        console.log('Email sent:', info.messageId);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * 헬스 체크 엔드포인트
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Email server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * 이메일 설정 테스트 엔드포인트
 */
app.post('/api/test-email-config', async (req: Request, res: Response) => {
    try {
        const { emailConfig }: { emailConfig?: EmailConfig } = req.body;
        const config = emailConfig || getDefaultEmailConfig();

        if (!config.auth.user || !config.auth.pass) {
            return res.status(400).json({
                success: false,
                message: 'Email credentials are required'
            });
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            }
        });

        // SMTP 연결 테스트
        await transporter.verify();

        res.json({
            success: true,
            message: 'Email configuration is valid'
        });
    } catch (error) {
        console.error('Email config test error:', error);
        res.status(500).json({
            success: false,
            message: 'Email configuration is invalid',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Email server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;