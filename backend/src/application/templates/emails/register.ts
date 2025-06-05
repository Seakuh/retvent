export const registerTemplate = `
<!DOCTYPE html>
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
            background: linear-gradient(135deg, var(--color-neon-blue-dark-2) 0%, #001122 100%);
            color: #ffffff;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #0a0a0a, #1a1a2e);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, var(--color-neon-blue) 0%, var(--color-neon-purple) 100%);
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
            background: radial-gradient(circle, var(--color-neon-pink-light) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
        }

        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
            filter: drop-shadow(0 0 20px var(--color-neon-blue-light));
        }

        .welcome-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
            text-shadow: 0 0 20px var(--color-neon-blue-light);
        }

        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            margin-bottom: 25px;
            color: var(--color-neon-green);
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
            padding: 15px;
            background: linear-gradient(90deg, var(--color-neon-blue-light) 0%, var(--color-neon-pink-light) 100%);
            border-radius: 12px;
            border-left: 4px solid var(--color-neon-green);
            transition: transform 0.3s ease;
        }

        .feature-item:hover {
            transform: translateX(5px);
        }

        .feature-icon {
            width: 24px;
            height: 24px;
            margin-right: 15px;
            color: var(--color-neon-green);
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
            background: linear-gradient(135deg, var(--color-neon-pink-light) 0%, var(--color-neon-blue-light) 100%);
            border-radius: 15px;
            border: 1px solid var(--color-neon-purple);
        }

        .cta-button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, var(--color-neon-pink) 0%, var(--color-neon-orange) 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(255, 113, 206, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 113, 206, 0.5);
        }

        .footer {
            background: var(--color-neon-blue-dark-2);
            padding: 30px;
            text-align: center;
            border-top: 1px solid var(--color-neon-blue-light);
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
            color: var(--color-neon-green);
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
                <h3 style="color: var(--color-neon-yellow); margin-bottom: 15px;">Ready to Get Started?</h3>
                <p style="margin-bottom: 20px; color: #cccccc;">Explore events, create memories, and connect with your community.</p>
                <a href="https://event-scanner.com" class="cta-button">Start Exploring</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Thank you for joining Event Scanner!<br>
                Follow us to stay connected and never miss an update.
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">Instagram</a>
                <a href="#" class="social-link">Twitter</a>
                <a href="#" class="social-link">Facebook</a>
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
