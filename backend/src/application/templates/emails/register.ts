export const registerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Event Scanner</title>
    <style>
        :root {
            --color-neon-pink: #ff71ce;
            --color-neon-blue: #01cdfe;
            --color-neon-green: #05ffa1;
            --color-neon-purple: #b967ff;
            --color-neon-yellow: #fffb96;
            --color-neon-orange: #ff9500;
            --color-neon-blue-light: #01cbfe44;
            --color-neon-pink-light: #ff71ce44;
            --color-neon-pink-light-2: #ff71ce88;
            --color-neon-blue-light-2: #01cbfea4;
            --color-neon-blue-dark: #007bff;
            --color-neon-blue-dark-2: #000033;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #0a0a0a;
            border-radius: 20px;
            overflow: hidden;
        }

        .header {
            background: #0a0a0a;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: transparent;
            animation: none;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
        }

        .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
            border-radius: 24px;
            object-fit: cover;
        }

        .welcome-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
            color: #01cdfe;
        }

        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 2;
            color: #ffffff;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            margin-bottom: 25px;
            color: #01cdfe;
            text-align: center;
        }

        .description {
            font-size: 16px;
            margin-bottom: 30px;
            text-align: center;
            color: #cccccc;
        }

        .features {
            margin: 30px 0;
        }

        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: #1a1a1a;
            border-radius: 16px;
            border: 2px solid #333333;
            transition: all 0.3s ease;
        }

        .feature-item:hover {
            border-color: var(--color-neon-blue);
            background: #222222;
        }

        .feature-icon {
            width: 24px;
            height: 24px;
            margin-right: 15px;
            color: var(--color-neon-blue);
            font-size: 20px;
        }

        .feature-text {
            flex: 1;
            font-size: 15px;
            color: #ffffff;
        }

        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #1a1a1a;
            border-radius: 15px;
            border: 2px solid #333333;
        }

        .cta-button {
            display: inline-block;
            padding: 16px 40px;
            color: #ffffff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: none;
            cursor: pointer;
            background: #0099cc;

        }

        .cta-button:hover {
            transform: translateY(-2px);
        }

        .footer {
            background: #0a0a0a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #333333;
        }

        .footer-text {
            font-size: 14px;
            color: #888888;
            margin-bottom: 15px;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: var(--color-neon-blue);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }

        .social-link:hover {
            color: #ffffff;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .welcome-title {
                font-size: 28px;
            }
            
            .logo {
                width: 100px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://event-scanner.com/logo.png" alt="Event Scanner Logo" class="logo">
            <div class="welcome-title">Welcome to Event Scanner!</div>
            <div class="subtitle">Your gateway to amazing events</div>
        </div>
        
        <div class="content">
            <div class="greeting">🎉 Registration Successful! 🎉</div>
            
            <div class="description">
                Congratulations! You're now part of the Event Scanner community. Get ready to discover, create, and experience events like never before.
            </div>
            
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">🎫</div>
                    <div class="feature-text">
                        <strong>Create Tickets</strong><br>
                        Design and manage your own event tickets with ease
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🔔</div>
                    <div class="feature-text">
                        <strong>Stay Updated</strong><br>
                        Get instant email notifications about new events and artists
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📍</div>
                    <div class="feature-text">
                        <strong>Discover Nearby Events</strong><br>
                        Find exciting events happening right in your area
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">💬</div>
                    <div class="feature-text">
                        <strong>Engage & Connect</strong><br>
                        Like and comment on events, connect with fellow event-goers
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <h3 style="color:white; margin-bottom: 15px;">Ready to Get Started?</h3>
                <p style="margin-bottom: 20px; color: #ffffff;">Explore events, create memories, and connect with your community.</p>
                <a href="https://event-scanner.com/dashboard" class="cta-button">Start Exploring</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Thank you for joining Event Scanner!<br>
                Follow us to stay connected and never miss an update.
            </div>
            

            <div style="font-size: 12px; color: #666666; margin-top: 20px;">
                © 2025 Event Scanner. All rights reserved.<br>
                If you have any questions, feel free to contact our support team.
            </div>
        </div>
    </div>
</body>
</html>
`;
