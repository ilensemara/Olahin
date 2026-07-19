<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Olahin - Kelola Kulkas Pintar & Cegah Limbah Pangan</title>
    
    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#10b981">
    <link rel="apple-touch-icon" href="/images/logo-192.png">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome for Premium Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- CSS Styling (Vanilla CSS with Rich Aesthetics & Glassmorphism) -->
    <style>
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: rgba(30, 41, 59, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            
            --accent-green: #10b981;
            --accent-green-glow: rgba(16, 185, 129, 0.15);
            --accent-red: #ef4444;
            --accent-red-glow: rgba(239, 68, 68, 0.15);
            --accent-yellow: #f59e0b;
            --accent-yellow-glow: rgba(245, 158, 11, 0.15);
            --accent-blue: #3b82f6;
            --accent-blue-glow: rgba(59, 130, 246, 0.15);
            
            --gradient-accent: linear-gradient(135deg, #10b981 0%, #059669 100%);
            --gradient-blue: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            --gradient-dark: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            --shadow-premium: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            --radius-lg: 16px;
            --radius-md: 12px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
        }

        h1, h2, h3, h4, .brand-name {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
        }

        /* Sidebar Navigation */
        .sidebar {
            width: 260px;
            background: rgba(15, 23, 42, 0.95);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 24px;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 100;
            backdrop-filter: blur(20px);
            transition: transform 0.3s ease;
        }

        .brand-container {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
        }

        .brand-logo {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: var(--gradient-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
            box-shadow: 0 0 15px var(--accent-green-glow);
        }

        .brand-name {
            font-size: 24px;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .menu-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-grow: 1;
        }

        .menu-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            border-radius: var(--radius-md);
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .menu-item i {
            font-size: 18px;
            width: 24px;
            text-align: center;
        }

        .menu-item:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.04);
        }

        .menu-item.active {
            color: white;
            background: var(--gradient-accent);
            box-shadow: 0 8px 20px -6px var(--accent-green-glow);
        }

        .user-profile-section {
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: white;
        }

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-size: 14px;
            font-weight: 600;
        }

        .user-role {
            font-size: 12px;
            color: var(--text-muted);
        }

        /* Main Content Panel */
        .main-content {
            margin-left: 260px;
            flex-grow: 1;
            padding: 40px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .header-panel {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-title-section h1 {
            font-size: 32px;
            margin-bottom: 6px;
        }

        .header-title-section p {
            color: var(--text-muted);
            font-size: 15px;
        }

        .action-group {
            display: flex;
            gap: 12px;
        }

        /* App Button Component */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 20px;
            border-radius: var(--radius-md);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            outline: none;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary {
            background: var(--gradient-accent);
            color: white;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-main);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }

        .btn-danger {
            background: var(--accent-red);
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
            transform: translateY(-2px);
        }

        /* Glassmorphic Panel Cards */
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 24px;
            backdrop-filter: blur(16px);
            box-shadow: var(--shadow-premium);
        }

        /* Grid Layouts */
        .grid-dashboard {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 32px;
        }

        .grid-3col {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
        }

        /* Expiry Alerts Pills */
        .badge {
            display: inline-flex;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge-red {
            background: var(--accent-red-glow);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .badge-yellow {
            background: var(--accent-yellow-glow);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .badge-green {
            background: var(--accent-green-glow);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        /* Refrigerator List View styling */
        .fridge-item-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 16px;
        }

        .fridge-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: var(--radius-md);
            transition: all 0.2s ease;
        }

        .fridge-row:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.08);
            transform: translateX(4px);
        }

        .item-meta {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .category-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: var(--accent-green);
        }

        .item-details h4 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .item-details p {
            font-size: 13px;
            color: var(--text-muted);
        }

        .item-qty-badge {
            font-size: 15px;
            font-weight: 700;
            color: white;
            background: rgba(255, 255, 255, 0.08);
            padding: 4px 10px;
            border-radius: 6px;
        }

        .fridge-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .btn-delete-icon {
            color: var(--text-muted);
            cursor: pointer;
            font-size: 16px;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .btn-delete-icon:hover {
            color: var(--accent-red);
            background: var(--accent-red-glow);
        }

        /* Recipes Styling */
        .recipe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 24px;
        }

        .recipe-card {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .recipe-card:hover {
            transform: translateY(-6px);
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }

        .recipe-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .recipe-match-percentage {
            background: var(--gradient-accent);
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
        }

        .recipe-title {
            font-size: 20px;
            line-height: 1.3;
            margin-bottom: 8px;
        }

        .recipe-desc {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
            flex-grow: 1;
            margin-bottom: 20px;
        }

        .recipe-stats-row {
            display: flex;
            gap: 16px;
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
            margin-bottom: 20px;
        }

        .recipe-stat {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--text-muted);
        }

        .recipe-stat i {
            color: var(--accent-green);
        }

        .recipe-ingredients-preview {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
            background: rgba(0,0,0,0.15);
            padding: 12px;
            border-radius: 8px;
        }

        .ing-preview-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .ing-preview-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }

        .ing-preview-item.matched {
            color: var(--accent-green);
        }

        .ing-preview-item.missing {
            color: var(--text-muted);
            text-decoration: line-through;
        }

        /* Modal backdrop view */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-container {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: var(--shadow-premium);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
        }

        .modal-overlay.active .modal-container {
            transform: scale(1);
        }

        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            font-size: 20px;
        }

        .modal-close {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 20px;
            cursor: pointer;
        }

        .modal-body {
            padding: 24px;
        }

        .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        /* Form Inputs */
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--text-muted);
        }

        .form-control {
            width: 100%;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--border-color);
            padding: 12px 16px;
            border-radius: var(--radius-md);
            color: white;
            font-size: 15px;
            outline: none;
            transition: all 0.2s ease;
        }

        .form-control:focus {
            border-color: var(--accent-green);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        /* Camera Scanner Modal laser animation */
        .scanner-view-container {
            position: relative;
            width: 100%;
            height: 300px;
            background: #000;
            border-radius: var(--radius-md);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--border-color);
            margin-bottom: 20px;
        }

        .scanner-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .laser-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(to bottom, transparent, var(--accent-green), transparent);
            box-shadow: 0 0 12px var(--accent-green);
            top: 0;
            animation: scanning 2.5s infinite linear;
            display: none;
        }

        @keyframes scanning {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }

        /* Voice Recorder styling */
        .recorder-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 30px 10px;
        }

        .mic-btn-container {
            position: relative;
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: var(--gradient-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            transition: all 0.25s ease;
        }

        .mic-btn-container i {
            font-size: 32px;
            color: white;
        }

        .mic-btn-container.recording {
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
            animation: pulse-recording 1.5s infinite ease-in-out;
        }

        @keyframes pulse-recording {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
        }

        .pulse-waves {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: inherit;
            top: 0;
            left: 0;
            z-index: -1;
            opacity: 0.5;
        }

        .mic-btn-container.recording .pulse-waves {
            animation: pulse-wave-expand 2s infinite linear;
        }

        @keyframes pulse-wave-expand {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.8); opacity: 0; }
        }

        .recorder-status {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .recorder-status.recording {
            color: var(--accent-red);
        }

        .transcript-live-box {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            padding: 16px;
            border-radius: var(--radius-md);
            min-height: 80px;
            font-size: 14px;
            color: var(--text-main);
            line-height: 1.5;
            text-align: center;
        }

        /* Waste Insights Dashboard styling */
        .stat-banner-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        .stat-card {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }

        .stat-card:nth-child(1) .stat-icon {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent-green);
        }

        .stat-card:nth-child(2) .stat-icon {
            background: rgba(245, 158, 11, 0.1);
            color: var(--accent-yellow);
        }

        .stat-card:nth-child(3) .stat-icon {
            background: rgba(59, 130, 246, 0.1);
            color: var(--accent-blue);
        }

        .stat-number {
            font-size: 28px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 13px;
            color: var(--text-muted);
        }

        /* SVG Bar Chart Styling */
        .chart-container {
            width: 100%;
            height: 280px;
            margin-top: 24px;
            position: relative;
        }

        .chart-svg {
            width: 100%;
            height: 100%;
        }

        /* Nutrition Targets Profile */
        .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
        }

        .nutrition-progress-ring {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* App pages view toggles */
        .app-view {
            display: none;
        }

        .app-view.active {
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        /* Loader Overlay spinner */
        .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        }

        .loader-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: var(--accent-green);
            border-radius: 50%;
            animation: spin 1s infinite linear;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Alert notifications */
        .toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .toast {
            background: var(--bg-secondary);
            border-left: 4px solid var(--accent-green);
            border-radius: var(--radius-md);
            padding: 16px 20px;
            color: white;
            box-shadow: var(--shadow-premium);
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 300px;
            transform: translateY(20px);
            opacity: 0;
            animation: toast-in 0.3s forwards ease;
        }

        @keyframes toast-in {
            to { transform: translateY(0); opacity: 1; }
        }

        /* Steps Cooking Steps View */
        .cooking-step-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            align-items: center;
            text-align: center;
            padding: 20px 0;
        }

        .step-indicator {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--accent-green);
        }

        .step-text {
            font-size: 20px;
            font-weight: 500;
            line-height: 1.5;
            max-width: 440px;
        }

        .step-timer-wrapper {
            margin: 20px 0;
            position: relative;
            width: 140px;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .timer-progress-svg {
            position: absolute;
            transform: rotate(-90deg);
            width: 100%;
            height: 100%;
        }

        .timer-progress-svg circle {
            fill: transparent;
            stroke-width: 6;
        }

        .timer-progress-svg .track {
            stroke: rgba(255,255,255,0.08);
        }

        .timer-progress-svg .bar {
            stroke: var(--accent-green);
            stroke-linecap: round;
            stroke-dasharray: 402;
            stroke-dashoffset: 0;
            transition: stroke-dashoffset 0.1s linear;
        }

        .timer-time {
            font-size: 26px;
            font-weight: 800;
            font-family: 'Outfit', sans-serif;
        }

        /* Responsive Mobile Layouts */
        @media (max-width: 900px) {
            body {
                flex-direction: column;
            }

            .sidebar {
                width: 100%;
                height: auto;
                position: fixed;
                bottom: 0;
                top: auto;
                left: 0;
                right: 0;
                flex-direction: row;
                padding: 10px 16px;
                border-right: none;
                border-top: 1px solid var(--border-color);
                box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.4);
                justify-content: space-around;
            }

            .brand-container, .user-profile-section {
                display: none;
            }

            .menu-list {
                flex-direction: row;
                width: 100%;
                justify-content: space-around;
                gap: 0;
            }

            .menu-item {
                flex-direction: column;
                padding: 8px 12px;
                font-size: 11px;
                gap: 4px;
            }

            .menu-item i {
                font-size: 20px;
            }

            .main-content {
                margin-left: 0;
                padding: 24px 20px 100px 20px;
            }

            .grid-dashboard {
                grid-template-columns: 1fr;
            }

            .stat-banner-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .profile-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>

    <!-- Global Loader Overlay -->
    <div id="loaderOverlay" class="loader-overlay">
        <div class="spinner"></div>
    </div>

    <!-- Toast Notifications -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Sidebar Navigation -->
    <nav class="sidebar">
        <div class="brand-container">
            <div class="brand-logo"><i class="fa-solid fa-kitchen-set"></i></div>
            <h2 class="brand-name">Olahin</h2>
        </div>

        <ul class="menu-list">
            <li>
                <div onclick="switchView('viewFridge')" class="menu-item active" id="btn-viewFridge">
                    <i class="fa-solid fa-cubes-stacked"></i>
                    <span>Kulkas Saya</span>
                </div>
            </li>
            <li>
                <div onclick="switchView('viewRecipes')" class="menu-item" id="btn-viewRecipes">
                    <i class="fa-solid fa-utensils"></i>
                    <span>Resep Masak</span>
                </div>
            </li>
            <li>
                <div onclick="switchView('viewInsights')" class="menu-item" id="btn-viewInsights">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Laporan Waste</span>
                </div>
            </li>
            <li>
                <div onclick="switchView('viewProfile')" class="menu-item" id="btn-viewProfile">
                    <i class="fa-solid fa-user-gear"></i>
                    <span>Profil Nutrisi</span>
                </div>
            </li>
        </ul>

        <div class="user-profile-section">
            <div class="user-avatar">BS</div>
            <div class="user-info">
                <span class="user-name">Budi Santoso</span>
                <span class="user-role">Koki Olahin</span>
            </div>
        </div>
    </nav>

    <!-- Main Content Panel -->
    <main class="main-content">
        
        <!-- HEADER PANEL -->
        <div class="header-panel">
            <div class="header-title-section">
                <h1 id="pageTitle">Kulkas Saya</h1>
                <p id="pageDescription">Kelola sisa stok bahan kulkas Anda, kurangi sampah pangan di dapur.</p>
            </div>
            <div class="action-group" id="headerActions">
                <button onclick="openModal('modalAdd')" class="btn btn-secondary"><i class="fa-solid fa-plus"></i> Manual</button>
                <button onclick="openVoiceScan()" class="btn btn-secondary"><i class="fa-solid fa-microphone"></i> Suara</button>
                <button onclick="openCameraScan()" class="btn btn-primary"><i class="fa-solid fa-camera"></i> Foto Bahan</button>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- VIEW 1: KULKAS SAYA (FRIDGE INVENTORY) -->
        <!-- ============================================== -->
        <div id="viewFridge" class="app-view active">
            <div class="grid-dashboard">
                
                <!-- Inventory List Card -->
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 20px;">Bahan Makanan Tersedia</h2>
                        <span style="font-size: 13px; color: var(--text-muted);" id="stockCount">0 bahan terdaftar</span>
                    </div>

                    <div id="fridgeItemList" class="fridge-item-list">
                        <!-- Dynamic items loaded here -->
                        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                            <i class="fa-solid fa-box-open" style="font-size: 40px; margin-bottom: 12px; display: block;"></i>
                            Loading data kulkas...
                        </div>
                    </div>
                </div>

                <!-- Expiry alerts quick summary card -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card" style="border-color: rgba(239, 68, 68, 0.2);">
                        <h3 style="font-size: 18px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; color: var(--accent-red)">
                            <i class="fa-solid fa-triangle-exclamation"></i> Darurat Kedaluwarsa
                        </h3>
                        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4;">
                            Bahan di bawah ini mendekati kedaluwarsa dalam 3 hari. Masak segera untuk mencegah limbah makanan!
                        </p>
                        <div id="expiryUrgentList" style="display: flex; flex-direction: column; gap: 10px;">
                            <!-- Urgent alerts load here -->
                            <div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px;">
                                Kulkas Anda aman, tidak ada bahan darurat!
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 style="font-size: 18px; margin-bottom: 14px;">Tips Dapur Olahin</h3>
                        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6;" id="kitchenTip">
                            "Membungkus daun bayam dalam tisu kering sebelum menyimpannya di wadah kedap udara dapat memperpanjang kesegaran hingga 5 hari."
                        </p>
                    </div>
                </div>

            </div>
        </div>

        <!-- ============================================== -->
        <!-- VIEW 2: REKOMENDASI RESEP (RECIPES) -->
        <!-- ============================================== -->
        <div id="viewRecipes" class="app-view">
            <div class="recipe-grid" id="recipeGridList">
                <!-- Recipes matched load here dynamically -->
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    Loading rekomendasi masakan...
                </div>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- VIEW 3: LAPORAN WASTE (INSIGHTS) -->
        <!-- ============================================== -->
        <div id="viewInsights" class="app-view">
            <div class="stat-banner-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-leaf"></i></div>
                    <div>
                        <div class="stat-number" id="insightWasteText">0.0 kg</div>
                        <div class="stat-label">Limbah Dicegah</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-rupiah-sign"></i></div>
                    <div>
                        <div class="stat-number" id="insightCostText">Rp 0</div>
                        <div class="stat-label">Uang Dihemat</div>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-cloud-arrow-down"></i></div>
                    <div>
                        <div class="stat-number" id="insightCo2Text">0.0 kg</div>
                        <div class="stat-label">Emisi CO2 Ditekan</div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 8px;">
                <h3 style="font-size: 20px; margin-bottom: 8px;">Grafik Penyelamatan Pangan (7 Hari Terakhir)</h3>
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">
                    Statistik harian bahan makanan yang berhasil Anda selamatkan dari kedaluwarsa.
                </p>
                <div class="chart-container">
                    <svg id="weeklyStatsSvg" viewBox="0 0 700 280" class="chart-svg">
                        <!-- Chart dynamically drawn with JS -->
                    </svg>
                </div>
            </div>
        </div>

        <!-- ============================================== -->
        <!-- VIEW 4: PROFIL NUTRISI (PROFILE SETTINGS) -->
        <!-- ============================================== -->
        <div id="viewProfile" class="app-view">
            <div class="profile-grid">
                
                <!-- Target form settings card -->
                <div class="card">
                    <h3 style="font-size: 20px; margin-bottom: 20px;">Atur Target Harian Nutrisi</h3>
                    
                    <div class="form-group">
                        <label>Target Kalori (kkal)</label>
                        <input type="number" id="targetCalories" value="2000" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Karbohidrat (g)</label>
                        <input type="number" id="targetCarbs" value="250" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Protein (g)</label>
                        <input type="number" id="targetProtein" value="75" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Lemak (g)</label>
                        <input type="number" id="targetFat" value="65" class="form-control">
                    </div>

                    <button onclick="saveNutritionTargets()" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
                        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Target
                    </button>
                </div>

                <!-- Summary statistics ring layout -->
                <div class="card" style="display: flex; flex-direction: column; gap: 20px;">
                    <h3 style="font-size: 20px; margin-bottom: 10px;">Status Kebutuhan Tubuh</h3>
                    <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5;">
                        Status kecukupan nutrisi harian dihitung berdasarkan makanan yang Anda olah melalui aplikasi hari ini.
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px;">
                        <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Kalori Masuk</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-green);" id="currCalories">0 kkal</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Protein Masuk</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-blue);" id="currProtein">0 g</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Karbohidrat Masuk</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-yellow);" id="currCarbs">0 g</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
                            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Lemak Masuk</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--accent-red);" id="currFat">0 g</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </main>

    <!-- ============================================== -->
    <!-- MODALS SECTION -->
    <!-- ============================================== -->

    <!-- MODAL: CUSTOM CONFIRM DELETE -->
    <div id="modalConfirmDelete" class="modal-overlay">
        <div class="modal-container" style="max-width: 400px;">
            <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                <h3 style="color: var(--accent-red); display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Konfirmasi Hapus
                </h3>
                <button onclick="closeModal('modalConfirmDelete')" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="padding-top: 10px;">
                <p id="confirmDeleteMessage" style="font-size: 15px; color: var(--text-main); line-height: 1.5;"></p>
            </div>
            <div class="modal-footer" style="border-top: none; padding-top: 0;">
                <button onclick="closeModal('modalConfirmDelete')" class="btn btn-secondary">Batal</button>
                <button onclick="confirmDeleteIngredient()" class="btn btn-primary" style="background: var(--accent-red); border-color: var(--accent-red);">Keluar dari Kulkas</button>
            </div>
        </div>
    </div>

    <!-- MODAL 1: ADD MANUAL INGREDIENT -->
    <div id="modalAdd" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Tambah Bahan Kulkas</h3>
                <button onclick="closeModal('modalAdd')" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="addName">Nama Bahan</label>
                    <input type="text" id="addName" placeholder="Contoh: Bawang Merah, Daging Ayam" class="form-control">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="addQty">Jumlah</label>
                        <input type="number" id="addQty" value="1" step="any" min="0.01" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="addUnit">Satuan</label>
                        <select id="addUnit" class="form-control">
                            <option value="pcs">pcs / butir</option>
                            <option value="gr">gram (gr)</option>
                            <option value="ml">mililiter (ml)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="addExpiry">Kedaluwarsa (hari lagi)</label>
                        <input type="number" id="addExpiry" value="7" min="1" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="addCategory">Kategori</label>
                        <select id="addCategory" class="form-control">
                            <option value="Bumbu">Bumbu</option>
                            <option value="Sayuran">Sayuran</option>
                            <option value="Daging & Telur">Daging & Telur</option>
                            <option value="Minyak & Lemak">Minyak & Lemak</option>
                            <option value="Protein Nabati">Protein Nabati</option>
                            <option value="Buah">Buah</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal('modalAdd')" class="btn btn-secondary">Batal</button>
                <button onclick="submitManualIngredient()" class="btn btn-primary">Tambahkan</button>
            </div>
        </div>
    </div>

    <!-- MODAL 2: CAMERA IMAGE UPLOADER (Option 2/3 - Easy Camera) -->
    <div id="modalCamera" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Deteksi AI via Foto Bahan</h3>
                <button onclick="closeModal('modalCamera')" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
                    Pilih file foto bahan kulkas Anda. Server AI Olahin akan otomatis mendeteksi bahan pangan yang ada di dalam gambar menggunakan YOLOv8.
                </p>

                <div class="scanner-view-container">
                    <img id="scannedImagePreview" class="scanner-img" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" alt="Preview Image">
                    <div id="laserScanner" class="laser-line"></div>
                </div>

                <div class="form-group">
                    <label>Pilih File Foto Kulkas</label>
                    <input type="file" id="cameraFileInput" accept="image/*" class="form-control" onchange="previewImageFile(event)">
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal('modalCamera')" class="btn btn-secondary">Batal</button>
                <button onclick="uploadAndDetectImage()" id="btnScanImage" class="btn btn-primary" disabled><i class="fa-solid fa-expand"></i> Mulai Deteksi Gambar</button>
            </div>
        </div>
    </div>

    <!-- MODAL 3: SPEECH SCANNER (Web Speech API - Zero Setup Voice) -->
    <div id="modalVoice" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Deteksi AI via Input Suara</h3>
                <button onclick="closeModal('modalVoice')" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5;">
                    Tekan tombol mikrofon dan ucapkan nama bahan serta jumlahnya dalam bahasa Indonesia.<br>
                    <strong>Contoh:</strong> <i>"Saya punya telur empat butir sama bawang merah seratus gram"</i>
                </p>

                <div class="recorder-container">
                    <div onclick="toggleLiveSpeechRecording()" id="micBtnContainer" class="mic-btn-container">
                        <i class="fa-solid fa-microphone" id="micIcon"></i>
                        <div class="pulse-waves"></div>
                    </div>
                    <span id="recorderStatus" class="recorder-status">Ketuk ikon mic untuk mulai merekam</span>
                </div>

                <div id="transcriptBox" class="transcript-live-box">
                    Transkrip suara Anda akan muncul di sini secara real-time...
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal('modalVoice')" class="btn btn-secondary">Batal</button>
                <button onclick="applyTranscriptResult()" id="btnApplyVoice" class="btn btn-primary" disabled>Tambahkan Bahan</button>
            </div>
        </div>
    </div>

    <!-- MODAL 4: RECIPE DETAIL & COOKING FLOW -->
    <div id="modalRecipeDetail" class="modal-overlay">
        <div class="modal-container" style="max-width: 600px;">
            <div class="modal-header">
                <h3 id="recipeDetailTitle">Judul Resep</h3>
                <button onclick="closeModal('modalRecipeDetail')" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 20px;">
                <p id="recipeDetailDesc" style="font-size: 14px; color: var(--text-muted); line-height: 1.5;"></p>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: rgba(0,0,0,0.15); padding: 12px 16px; border-radius: 8px; text-align: center;">
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Kalori</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--accent-green);" id="recipeDetailCalories">0 kkal</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Karbo</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--accent-yellow);" id="recipeDetailCarbs">0 g</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Protein</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--accent-blue);" id="recipeDetailProtein">0 g</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Lemak</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--accent-red);" id="recipeDetailFat">0 g</div>
                    </div>
                </div>

                <div>
                    <h4 style="font-size: 15px; margin-bottom: 10px;">Bahan Masakan</h4>
                    <div id="recipeDetailIngredientsList" style="display: flex; flex-direction: column; gap: 8px;">
                        <!-- Ingredients list -->
                    </div>
                </div>

                <div id="recipeVideoArea" style="display: none;">
                    <h4 style="font-size: 15px; margin-bottom: 10px;"><i class="fa-brands fa-youtube" style="color: red"></i> Video Panduan Memasak</h4>
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <iframe id="recipeDetailIframe" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" src="" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal('modalRecipeDetail')" class="btn btn-secondary">Kembali</button>
                <button id="btnStartCookingFlow" class="btn btn-primary">Mulai Panduan Langkah-Langkah</button>
            </div>
        </div>
    </div>

    <!-- MODAL 5: STEP-BY-STEP COOKING PROGRESS (GUIDE) -->
    <div id="modalCookingGuide" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3 id="cookingGuideTitle">Memasak Resep</h3>
                <button onclick="stopCookingProcess()" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="modal-body">
                <div class="cooking-step-container">
                    <span id="cookingStepIndex" class="step-indicator">Langkah 1 dari 5</span>
                    <p id="cookingStepText" class="step-text">Teks langkah memasak muncul di sini...</p>
                    
                    <!-- Circular step timer -->
                    <div id="cookingTimerContainer" class="step-timer-wrapper" style="display: none;">
                        <svg class="timer-progress-svg">
                            <circle class="track" cx="70" cy="70" r="64"></circle>
                            <circle id="timerProgressCircle" class="bar" cx="70" cy="70" r="64"></circle>
                        </svg>
                        <div id="cookingTimerText" class="timer-time">00 : 00</div>
                    </div>

                    <div id="timerActionControls" style="display: none; gap: 12px; margin-top: 10px;">
                        <button onclick="toggleCookingStepTimer()" id="btnToggleTimer" class="btn btn-secondary"><i class="fa-solid fa-play"></i> Mulai Timer</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="justify-content: space-between;">
                <button onclick="navigateCookingStep(-1)" id="btnPrevStep" class="btn btn-secondary"><i class="fa-solid fa-arrow-left"></i> Sebelum</button>
                <button onclick="navigateCookingStep(1)" id="btnNextStep" class="btn btn-primary">Berikutnya <i class="fa-solid fa-arrow-right"></i></button>
            </div>
        </div>
    </div>

    <!-- MODAL 6: COOKING SUCCESS SCREEN STATS -->
    <div id="modalCookingSuccess" class="modal-overlay">
        <div class="modal-container" style="text-align: center; max-width: 440px;">
            <div class="modal-body" style="padding: 40px 30px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent-green-glow); display: flex; align-items: center; justify-content: center; font-size: 36px; color: var(--accent-green);">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                
                <h2 style="font-size: 24px; margin-top: 10px;">Masakan Selesai!</h2>
                <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 10px;">
                    Selamat, hidangan <strong id="successRecipeName">Resep</strong> Anda telah selesai dimasak. Stok bahan di kulkas telah diperbarui secara otomatis.
                </p>

                <div style="width: 100%; border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; flex-direction: column; gap: 14px;">
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span style="color: var(--text-muted);">Makanan Diselamatkan</span>
                        <strong id="successWastePrevented" style="color: var(--accent-green);">0.5 kg</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 14px;">
                        <span style="color: var(--text-muted);">Biaya yang Dihemat</span>
                        <strong id="successCostSaved" style="color: var(--accent-yellow);">Rp 15.000</strong>
                    </div>
                </div>

                <button onclick="closeSuccessScreen()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Kembali ke Menu Utama</button>
            </div>
        </div>
    </div>

    <!-- ============================================== -->
    <!-- JAVASCRIPT FRONT-END SPA CONTROLLER -->
    <!-- ============================================== -->
    <script>
        // Global State Variables
        let currentUserId = 1; // Default Seeder User Budi Santoso
        let fridgeData = [];
        let recipesData = [];
        let insightsData = [];
        let activeViewId = 'viewFridge';
        
        // Active cooking step tracking
        let activeRecipeObj = null;
        let activeStepIdx = 0;
        
        // Timer tracking variables
        let stepTimerId = null;
        let stepTimerRemainingSeconds = 0;
        let stepTimerTotalSeconds = 0;
        let isStepTimerRunning = false;
        
        // Live speech recognition variables
        let liveSpeechRecognitionInstance = null;
        let isLiveSpeechRecordingActive = false;
        let parsedVoiceIngredientsData = {};

        // Tips array for daily kitchen savings tips
        const KITCHEN_SAVING_TIPS = [
            "Membungkus daun bayam dalam tisu kering sebelum menyimpannya di wadah kedap udara dapat memperpanjang kesegaran hingga 5 hari.",
            "Simpan bawang merah dan bawang putih secara terpisah di tempat yang gelap, berventilasi baik, dan kering.",
            "Cabai merah akan tetap segar hingga 2 minggu jika tangkainya dilepas sebelum dimasukkan ke dalam kulkas.",
            "Masukkan sebutir kentang ke dalam kantong penyimpanan apel untuk mencegah apel dari pembusukan lebih cepat.",
            "Jika sisa sup bayam bening tidak habis hari ini, segera dibuang dan jangan dipanaskan kembali karena kandungan zat gizinya bisa beracun."
        ];

        // Setup API URLs
        const API_URL = '/api';

        // Page load initialization
        document.addEventListener('DOMContentLoaded', () => {
            initApp();
            
            // Randomize kitchen tip
            const randomTip = KITCHEN_SAVING_TIPS[Math.floor(Math.random() * KITCHEN_SAVING_TIPS.length)];
            document.getElementById('kitchenTip').innerText = `"${randomTip}"`;
        });

        // Initialize and load all data
        async function initApp() {
            showLoader(true);
            try {
                await Promise.all([
                    loadFridgeInventoryFromServer(),
                    loadRecipesFromServer(),
                    loadInsightsFromServer()
                ]);
            } catch (error) {
                console.error("Failed to load initial data:", error);
                showToast("Koneksi gagal terhubung ke backend Laravel.", "red");
            } finally {
                showLoader(false);
            }
        }

        // View Navigator switcher
        function switchView(viewId) {
            document.querySelectorAll('.app-view').forEach(view => {
                view.classList.remove('active');
            });
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });

            document.getElementById(viewId).classList.add('active');
            document.getElementById('btn-' + viewId).classList.add('active');
            activeViewId = viewId;

            // Update title and action header
            const pageTitle = document.getElementById('pageTitle');
            const pageDescription = document.getElementById('pageDescription');
            const headerActions = document.getElementById('headerActions');

            if (viewId === 'viewFridge') {
                pageTitle.innerText = "Kulkas Saya";
                pageDescription.innerText = "Kelola sisa stok bahan kulkas Anda, kurangi sampah pangan di dapur.";
                headerActions.style.display = 'flex';
                loadFridgeInventoryFromServer();
            } else if (viewId === 'viewRecipes') {
                pageTitle.innerText = "Rekomendasi Resep";
                pageDescription.innerText = "Resep makanan nusantara lezat yang dicocokkan dari stok kulkas Anda.";
                headerActions.style.display = 'none';
                loadRecipesFromServer();
            } else if (viewId === 'viewInsights') {
                pageTitle.innerText = "Laporan Waste";
                pageDescription.innerText = "Statistik sampah dapur yang berhasil diselamatkan dan biaya belanja dihemat.";
                headerActions.style.display = 'none';
                loadInsightsFromServer();
            } else if (viewId === 'viewProfile') {
                pageTitle.innerText = "Profil Nutrisi";
                pageDescription.innerText = "Sesuaikan kebutuhan kalori harian keluarga Anda sesuai target nutrisi.";
                headerActions.style.display = 'none';
                updateNutritionalProgressUI();
            }
        }

        // Loader helper
        function showLoader(show) {
            const loader = document.getElementById('loaderOverlay');
            if (show) loader.classList.add('active');
            else loader.classList.remove('active');
        }

        // Toast notifications alert
        function showToast(message, color = "green") {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast';
            
            // Set alert border accent colors
            if (color === "red") toast.style.borderLeftColor = "var(--accent-red)";
            else if (color === "yellow") toast.style.borderLeftColor = "var(--accent-yellow)";
            else toast.style.borderLeftColor = "var(--accent-green)";

            toast.innerHTML = `
                <i class="fa-solid ${color === 'red' ? 'fa-triangle-exclamation' : 'fa-circle-check'}" style="color: ${color === 'red' ? 'var(--accent-red)' : 'var(--accent-green)'}"></i>
                <span>${message}</span>
            `;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = "none";
                toast.style.opacity = "0";
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Modal triggers
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
            
            // Reset modal specific settings
            if (modalId === 'modalCamera') {
                document.getElementById('cameraFileInput').value = '';
                document.getElementById('scannedImagePreview').src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                document.getElementById('laserScanner').style.display = 'none';
                document.getElementById('btnScanImage').disabled = true;
            }
            if (modalId === 'modalVoice') {
                stopLiveSpeechRecording();
            }
        }

        // ==============================================
        // BACKEND LOAD OPERATIONS
        // ==============================================
        
        async function loadFridgeInventoryFromServer() {
            const response = await fetch(`${API_URL}/inventory`);
            const json = await response.json();
            if (json.success) {
                fridgeData = json.data;
                renderFridgeInventoryUI();
            }
        }

        async function loadRecipesFromServer() {
            const response = await fetch(`${API_URL}/recipes/match`);
            const json = await response.json();
            if (json.success) {
                recipesData = json.data;
                renderRecipesUI();
            }
        }

        async function loadInsightsFromServer() {
            const response = await fetch(`${API_URL}/insight`);
            const json = await response.json();
            if (json.success) {
                insightsData = json.chart_data;
                renderInsightsUI();
            }
        }

        // ==============================================
        // INVENTORY UI RENDER
        // ==============================================
        
        function renderFridgeInventoryUI() {
            const listContainer = document.getElementById('fridgeItemList');
            const urgentContainer = document.getElementById('expiryUrgentList');
            const stockCountLabel = document.getElementById('stockCount');

            // Reset UI lists
            listContainer.innerHTML = '';
            urgentContainer.innerHTML = '';
            stockCountLabel.innerText = `${fridgeData.length} bahan terdaftar`;

            if (fridgeData.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                        <i class="fa-solid fa-box-open" style="font-size: 40px; margin-bottom: 12px; display: block;"></i>
                        Kulkas Anda kosong! Tambahkan bahan secara manual atau gunakan pemindaian AI.
                    </div>
                `;
                urgentContainer.innerHTML = `
                    <div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px;">
                        Kulkas Anda aman, tidak ada bahan darurat!
                    </div>
                `;
                return;
            }

            const today = new Date();
            let urgentCount = 0;

            fridgeData.forEach(item => {
                const expDate = new Date(item.expiry_date);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Determine alert style
                let badgeClass = 'badge-green';
                let alertLabel = `${diffDays} hari lagi`;
                
                if (diffDays <= 0) {
                    badgeClass = 'badge-red';
                    alertLabel = 'Kedaluwarsa!';
                } else if (diffDays <= 3) {
                    badgeClass = 'badge-yellow';
                    alertLabel = `${diffDays} hari lagi`;
                }

                // Get category icon
                let catIcon = 'fa-carrot';
                const lowerCat = item.category.toLowerCase();
                if (lowerCat.includes('daging') || lowerCat.includes('telur')) catIcon = 'fa-egg';
                else if (lowerCat.includes('bumbu')) catIcon = 'fa-mortar-pestle';
                else if (lowerCat.includes('minyak') || lowerCat.includes('lemak')) catIcon = 'fa-bottle-droplet';
                else if (lowerCat.includes('nabati') || lowerCat.includes('tahu') || lowerCat.includes('tempe')) catIcon = 'fa-plate-wheat';
                else if (lowerCat.includes('buah')) catIcon = 'fa-apple-whole';

                // Add to general list
                const row = document.createElement('div');
                row.className = 'fridge-row';
                row.innerHTML = `
                    <div class="item-meta">
                        <div class="category-icon"><i class="fa-solid ${catIcon}"></i></div>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>${item.category} • Kedaluwarsa: ${item.expiry_date}</p>
                        </div>
                    </div>
                    <div class="fridge-actions">
                        <span class="item-qty-badge">${item.quantity} ${item.unit}</span>
                        <span class="badge ${badgeClass}">${alertLabel}</span>
                        <i onclick="deleteIngredientItem(${item.id})" class="fa-solid fa-trash-can btn-delete-icon"></i>
                    </div>
                `;
                listContainer.appendChild(row);

                // Add to urgent list if <= 3 days remaining
                if (diffDays <= 3) {
                    urgentCount++;
                    const urgentRow = document.createElement('div');
                    urgentRow.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(239, 68, 68, 0.05);
                        border: 1px solid rgba(239, 68, 68, 0.15);
                        padding: 10px 14px;
                        border-radius: 8px;
                        font-size: 13px;
                    `;
                    urgentRow.innerHTML = `
                        <strong style="color: white;">${item.name}</strong>
                        <span class="badge ${badgeClass}" style="padding: 3px 8px; font-size: 11px;">${alertLabel}</span>
                    `;
                    urgentContainer.appendChild(urgentRow);
                }
            });

            if (urgentCount === 0) {
                urgentContainer.innerHTML = `
                    <div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px;">
                        Kulkas Anda aman, tidak ada bahan darurat!
                    </div>
                `;
            }
        }

        // Manual submit handler
        async function submitManualIngredient() {
            const name = document.getElementById('addName').value.trim();
            const qty = parseFloat(document.getElementById('addQty').value);
            const unit = document.getElementById('addUnit').value;
            const expiry = parseInt(document.getElementById('addExpiry').value);
            const category = document.getElementById('addCategory').value;

            if (!name || isNaN(qty) || qty <= 0) {
                alert("Mohon isi nama bahan pangan dan kuantitas yang benar!");
                return;
            }

            const expDate = new Date();
            expDate.setDate(expDate.getDate() + expiry);
            const expDateStr = expDate.toISOString().split('T')[0];

            showLoader(true);
            try {
                const response = await fetch(`${API_URL}/inventory`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        name: name,
                        quantity: qty,
                        unit: unit,
                        expiry_date: expDateStr,
                        category: category
                    })
                });

                const data = await response.json();
                if (data.success) {
                    showToast(`Berhasil menambahkan ${name} ke kulkas.`);
                    closeModal('modalAdd');
                    
                    // Reset input
                    document.getElementById('addName').value = '';
                    document.getElementById('addQty').value = 1;
                    document.getElementById('addExpiry').value = 7;
                    
                    await initApp();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error("Error adding item:", err);
                showToast("Gagal menyimpan bahan makanan.", "red");
            } finally {
                showLoader(false);
            }
        }

        // Delete handler
        let deleteTargetId = null;

        function deleteIngredientItem(id) {
            deleteTargetId = id;
            const item = fridgeData.find(i => i.id === id);
            const itemName = item ? item.name : 'bahan ini';
            document.getElementById('confirmDeleteMessage').innerText = `Apakah Anda yakin ingin mengeluarkan "${itemName}" dari kulkas?`;
            openModal('modalConfirmDelete');
        }

        async function confirmDeleteIngredient() {
            if (!deleteTargetId) return;
            closeModal('modalConfirmDelete');
            showLoader(true);
            try {
                const headers = {};
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (csrfMeta) {
                    headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
                }

                const response = await fetch(`${API_URL}/inventory/${deleteTargetId}`, {
                    method: 'DELETE',
                    headers: headers
                });
                const data = await response.json();
                if (data.success) {
                    showToast("Bahan pangan berhasil dikeluarkan.");
                    await initApp();
                }
            } catch (err) {
                console.error("Error deleting item:", err);
                showToast("Gagal menghapus bahan pangan.", "red");
            } finally {
                showLoader(false);
                deleteTargetId = null;
            }
        }

        // ==============================================
        // RECIPES UI RENDER
        // ==============================================
        
        function renderRecipesUI() {
            const grid = document.getElementById('recipeGridList');
            grid.innerHTML = '';

            if (recipesData.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">
                        <i class="fa-solid fa-solid fa-circle-info" style="font-size: 40px; margin-bottom: 12px; display: block; color: var(--accent-yellow)"></i>
                        Tidak ada resep yang cocok dengan bahan kulkas saat ini (minimal cocok 50%).<br>
                        Tambahkan bahan sayuran, bumbu, atau daging ayam untuk membuka rekomendasi!
                    </div>
                `;
                return;
            }

            recipesData.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'card recipe-card';
                
                // Get previews of matched and missing items
                let ingredientsListHtml = '';
                
                // Show up to 3 matched ingredients
                const matches = recipe.matched_ingredients.slice(0, 2);
                matches.forEach(ing => {
                    ingredientsListHtml += `
                        <div class="ing-preview-item matched">
                            <span><i class="fa-solid fa-square-check"></i> ${ing.name}</span>
                            <span>${ing.qty_available}/${ing.qty_needed} ${ing.unit}</span>
                        </div>
                    `;
                });

                // Show up to 2 missing ingredients
                const missings = recipe.missing_ingredients.slice(0, 2);
                missings.forEach(ing => {
                    ingredientsListHtml += `
                        <div class="ing-preview-item missing">
                            <span><i class="fa-solid fa-square-xmark"></i> ${ing.name}</span>
                            <span>Butuh ${ing.qty_needed} ${ing.unit}</span>
                        </div>
                    `;
                });

                card.innerHTML = `
                    <div class="recipe-header">
                        <div>
                            <h3 class="recipe-title">${recipe.title}</h3>
                            <span class="recipe-match-percentage">${recipe.match_percentage}% Cocok</span>
                        </div>
                    </div>
                    <p class="recipe-desc">${recipe.description.substring(0, 100)}...</p>
                    
                    <div class="recipe-ingredients-preview">
                        <span class="ing-preview-title">Bahan Dapur Utama</span>
                        ${ingredientsListHtml}
                        ${(recipe.matched_ingredients.length + recipe.missing_ingredients.length > 4) ? 
                          `<span style="font-size: 11px; text-align: center; display: block; color: var(--text-muted); margin-top: 4px;">+ ${recipe.matched_ingredients.length + recipe.missing_ingredients.length - 4} bahan lainnya</span>` : ''}
                    </div>

                    <div class="recipe-stats-row">
                        <div class="recipe-stat"><i class="fa-regular fa-clock"></i> <span>${recipe.prep_time} Mnt</span></div>
                        <div class="recipe-stat"><i class="fa-solid fa-fire-flame-curved"></i> <span>${recipe.calories} kkal</span></div>
                    </div>
                    <button onclick="viewRecipeDetail(${recipe.id})" class="btn btn-secondary" style="width: 100%; margin-top: auto;">Mulai Olah Resep</button>
                `;
                grid.appendChild(card);
            });
        }

        // View single recipe details
        function viewRecipeDetail(recipeId) {
            const recipe = recipesData.find(r => r.id === recipeId);
            if (!recipe) return;

            activeRecipeObj = recipe;

            document.getElementById('recipeDetailTitle').innerText = recipe.title;
            document.getElementById('recipeDetailDesc').innerText = recipe.description;
            document.getElementById('recipeDetailCalories').innerText = `${recipe.calories} kkal`;
            document.getElementById('recipeDetailCarbs').innerText = `${recipe.carbs} g`;
            document.getElementById('recipeDetailProtein').innerText = `${recipe.protein} g`;
            document.getElementById('recipeDetailFat').innerText = `${recipe.fat} g`;

            // Populate ingredients
            const list = document.getElementById('recipeDetailIngredientsList');
            list.innerHTML = '';

            recipe.matched_ingredients.forEach(ing => {
                const row = document.createElement('div');
                row.style.cssText = "display:flex; justify-content:space-between; font-size:14px; padding: 6px 12px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 6px; color: #34d399;";
                row.innerHTML = `
                    <span><i class="fa-solid fa-circle-check"></i> <strong>${ing.name}</strong></span>
                    <span>Tersedia: ${ing.qty_available} / Butuh: ${ing.qty_needed} ${ing.unit}</span>
                `;
                list.appendChild(row);
            });

            recipe.missing_ingredients.forEach(ing => {
                const row = document.createElement('div');
                row.style.cssText = "display:flex; justify-content:space-between; font-size:14px; padding: 6px 12px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 6px; color: #f87171;";
                row.innerHTML = `
                    <span><i class="fa-solid fa-circle-xmark"></i> <strong>${ing.name}</strong></span>
                    <span>Belum Tersedia: Butuh ${ing.qty_needed} ${ing.unit}</span>
                `;
                list.appendChild(row);
            });

            // Video guide configuration
            const videoArea = document.getElementById('recipeVideoArea');
            const iframe = document.getElementById('recipeDetailIframe');
            if (recipe.video_url) {
                // Convert Youtube watch URL to embed link
                let embedUrl = recipe.video_url;
                if (recipe.video_url.includes('youtu.be/')) {
                    const videoId = recipe.video_url.split('youtu.be/')[1];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (recipe.video_url.includes('watch?v=')) {
                    const videoId = recipe.video_url.split('watch?v=')[1].split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
                iframe.src = embedUrl;
                videoArea.style.display = 'block';
            } else {
                iframe.src = '';
                videoArea.style.display = 'none';
            }

            // Setup Start cooking flow button trigger
            document.getElementById('btnStartCookingFlow').onclick = () => {
                closeModal('modalRecipeDetail');
                startCookingGuide();
            };

            openModal('modalRecipeDetail');
        }

        // ==============================================
        // STEP-BY-STEP COOKING FLOW PROCESS
        // ==============================================
        
        function startCookingGuide() {
            if (!activeRecipeObj || !activeRecipeObj.steps) return;
            
            activeStepIdx = 0;
            document.getElementById('cookingGuideTitle').innerText = activeRecipeObj.title;
            renderCookingStepUI();
            openModal('modalCookingGuide');
        }

        function stopCookingProcess() {
            clearInterval(stepTimerId);
            isStepTimerRunning = false;
            closeModal('modalCookingGuide');
        }

        function renderCookingStepUI() {
            const steps = activeRecipeObj.steps;
            const currentStepText = steps[activeStepIdx];
            
            // Set progress text
            document.getElementById('cookingStepIndex').innerText = `Langkah ${activeStepIdx + 1} dari ${steps.length}`;
            document.getElementById('cookingStepText').innerText = currentStepText;

            // Navigation buttons configuration
            document.getElementById('btnPrevStep').disabled = (activeStepIdx === 0);
            
            const nextBtn = document.getElementById('btnNextStep');
            if (activeStepIdx === steps.length - 1) {
                nextBtn.innerHTML = `Selesai Masak <i class="fa-solid fa-kitchen-set"></i>`;
                nextBtn.onclick = finishCookingRecipe;
            } else {
                nextBtn.innerHTML = `Berikutnya <i class="fa-solid fa-arrow-right"></i>`;
                nextBtn.onclick = () => navigateCookingStep(1);
            }

            // Check if step mentions a timer (contains minutes, e.g. "2-3 menit" or "15 menit")
            clearInterval(stepTimerId);
            document.getElementById('cookingTimerContainer').style.display = 'none';
            document.getElementById('timerActionControls').style.display = 'none';
            isStepTimerRunning = false;

            const timeMatch = currentStepText.match(/(\d+)\s*(?:-|sampai)?\s*(\d*)\s*menit/i);
            if (timeMatch) {
                // Get the high number if a range is present, else standard
                let durationMinutes = parseInt(timeMatch[2] || timeMatch[1]);
                setupCookingStepTimer(durationMinutes * 60);
            }
        }

        function navigateCookingStep(direction) {
            activeStepIdx += direction;
            renderCookingStepUI();
        }

        // Setup timer countdown visual circle
        function setupCookingStepTimer(seconds) {
            stepTimerTotalSeconds = seconds;
            stepTimerRemainingSeconds = seconds;
            
            document.getElementById('cookingTimerContainer').style.display = 'flex';
            document.getElementById('timerActionControls').style.display = 'flex';
            
            updateTimerDisplay();

            // Set play/pause controller state
            const toggleBtn = document.getElementById('btnToggleTimer');
            toggleBtn.innerHTML = `<i class="fa-solid fa-play"></i> Mulai Timer`;
        }

        function toggleCookingStepTimer() {
            const toggleBtn = document.getElementById('btnToggleTimer');
            
            if (isStepTimerRunning) {
                // Pause
                clearInterval(stepTimerId);
                isStepTimerRunning = false;
                toggleBtn.innerHTML = `<i class="fa-solid fa-play"></i> Mulai Timer`;
            } else {
                // Play
                isStepTimerRunning = true;
                toggleBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Timer`;
                
                stepTimerId = setInterval(() => {
                    stepTimerRemainingSeconds--;
                    updateTimerDisplay();
                    
                    if (stepTimerRemainingSeconds <= 0) {
                        clearInterval(stepTimerId);
                        isStepTimerRunning = false;
                        document.getElementById('cookingTimerText').innerText = "SELESAI!";
                        showToast("Waktu langkah memasak selesai!", "yellow");
                        alert("Langkah memasak ini sudah habis timernya!");
                    }
                }, 1000);
            }
        }

        function updateTimerDisplay() {
            const m = Math.floor(stepTimerRemainingSeconds / 60).toString().padStart(2, '0');
            const s = (stepTimerRemainingSeconds % 60).toString().padStart(2, '0');
            document.getElementById('cookingTimerText').innerText = `${m} : ${s}`;
            
            // Adjust SVG progress circle dash offset
            const percent = stepTimerRemainingSeconds / stepTimerTotalSeconds;
            const dashoffset = 402 - (percent * 402);
            document.getElementById('timerProgressCircle').style.strokeDashoffset = dashoffset;
        }

        // Finish Cooking and Post data to Laravel
        async function finishCookingRecipe() {
            stopCookingProcess();
            showLoader(true);

            try {
                const response = await fetch(`${API_URL}/recipes/cook`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({ recipe_id: activeRecipeObj.id })
                });

                const data = await response.json();
                if (data.success) {
                    // Update nutritional targets for today
                    updateProfileNutrientsToday(activeRecipeObj);

                    // Show success screen with stats
                    document.getElementById('successRecipeName').innerText = activeRecipeObj.title;
                    document.getElementById('successWastePrevented').innerText = `${data.data.waste_prevented_kg} kg`;
                    document.getElementById('successCostSaved').innerText = `Rp ${data.data.cost_saved_rp.toLocaleString('id-ID')}`;
                    
                    openModal('modalCookingSuccess');
                    await initApp();
                }
            } catch (err) {
                console.error("Error saving cook logs:", err);
                showToast("Gagal menyimpan rekam masak ke database.", "red");
            } finally {
                showLoader(false);
            }
        }

        function closeSuccessScreen() {
            closeModal('modalCookingSuccess');
            switchView('viewFridge');
        }

        // ==============================================
        // LAPORAN WASTE GRAPH (INSIGHTS RENDER)
        // ==============================================
        
        function renderInsightsUI() {
            // Calculate totals
            let totalWaste = 0;
            let totalCost = 0;

            insightsData.forEach(day => {
                totalWaste += day.waste_kg;
                totalCost += day.cost_saved;
            });

            const co2 = Number((totalWaste * 2.5).toFixed(1));

            document.getElementById('insightWasteText').innerText = `${totalWaste.toFixed(1)} kg`;
            document.getElementById('insightCostText').innerText = `Rp ${totalCost.toLocaleString('id-ID')}`;
            document.getElementById('insightCo2Text').innerText = `${co2} kg`;

            // Draw SVG bar chart
            const svg = document.getElementById('weeklyStatsSvg');
            svg.innerHTML = '';

            const maxWaste = Math.max(...insightsData.map(d => d.waste_kg), 0.5);
            const width = 700;
            const height = 280;
            const padding = 50;
            const chartHeight = height - padding * 2;
            const chartWidth = width - padding * 2;
            
            const colWidth = chartWidth / insightsData.length;

            // Draw grid lines
            for (let i = 0; i <= 4; i++) {
                const y = padding + (chartHeight / 4) * i;
                const value = (maxWaste - (maxWaste / 4) * i).toFixed(1);
                
                // Draw dotted line
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', padding);
                line.setAttribute('y1', y);
                line.setAttribute('x2', width - padding);
                line.setAttribute('y2', y);
                line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
                line.setAttribute('stroke-dasharray', '4');
                svg.appendChild(line);

                // Draw Y axis labels
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', padding - 10);
                text.setAttribute('y', y + 4);
                text.setAttribute('fill', 'var(--text-muted)');
                text.setAttribute('font-size', '11px');
                text.setAttribute('text-anchor', 'end');
                text.textContent = `${value} kg`;
                svg.appendChild(text);
            }

            // Draw bars & X labels
            insightsData.forEach((day, index) => {
                const x = padding + index * colWidth + colWidth / 4;
                const barWidth = colWidth / 2;
                
                const barHeight = (day.waste_kg / maxWaste) * chartHeight;
                const y = padding + chartHeight - barHeight;

                // Draw background bar track
                const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                track.setAttribute('x', x);
                track.setAttribute('y', padding);
                track.setAttribute('width', barWidth);
                track.setAttribute('height', chartHeight);
                track.setAttribute('fill', 'rgba(255,255,255,0.01)');
                track.setAttribute('rx', '4');
                svg.appendChild(track);

                // Draw active visual bar (emerald gradient color)
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', x);
                bar.setAttribute('y', y);
                bar.setAttribute('width', barWidth);
                bar.setAttribute('height', Math.max(barHeight, 4));
                bar.setAttribute('fill', 'var(--accent-green)');
                bar.setAttribute('rx', '4');
                bar.style.transition = "all 0.5s ease";
                svg.appendChild(bar);

                // Draw X labels
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', height - padding + 20);
                text.setAttribute('fill', 'var(--text-muted)');
                text.setAttribute('font-size', '12px');
                text.setAttribute('text-anchor', 'middle');
                text.textContent = day.day;
                svg.appendChild(text);

                // Draw bar tooltip values on top of bars
                if (day.waste_kg > 0) {
                    const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    valText.setAttribute('x', x + barWidth / 2);
                    valText.setAttribute('y', y - 8);
                    valText.setAttribute('fill', 'white');
                    valText.setAttribute('font-size', '10px');
                    valText.setAttribute('font-weight', 'bold');
                    valText.setAttribute('text-anchor', 'middle');
                    valText.textContent = `${day.waste_kg.toFixed(1)}`;
                    svg.appendChild(valText);
                }
            });
        }

        // ==============================================
        // NUTRITIONAL PROFILE LOGIC
        // ==============================================
        
        function updateNutritionalProgressUI() {
            // Load target settings from input
            const targetCals = parseInt(document.getElementById('targetCalories').value) || 2000;
            const targetP = parseInt(document.getElementById('targetProtein').value) || 75;
            const targetC = parseInt(document.getElementById('targetCarbs').value) || 250;
            const targetF = parseInt(document.getElementById('targetFat').value) || 65;

            // Load today's nutrition consumed from localstorage
            const todayStr = new Date().toISOString().split('T')[0];
            const saved = JSON.parse(localStorage.getItem(`nutri_${todayStr}`) || '{"cals":0,"protein":0,"carbs":0,"fat":0}');

            document.getElementById('currCalories').innerText = `${saved.cals} / ${targetCals} kkal`;
            document.getElementById('currProtein').innerText = `${saved.protein} / ${targetP} g`;
            document.getElementById('currCarbs').innerText = `${saved.carbs} / ${targetC} g`;
            document.getElementById('currFat').innerText = `${saved.fat} / ${targetF} g`;
        }

        // Save nutrition edits
        function saveNutritionTargets() {
            showToast("Target nutrisi harian telah diperbarui.");
            updateNutritionalProgressUI();
        }

        function updateProfileNutrientsToday(recipe) {
            const todayStr = new Date().toISOString().split('T')[0];
            const current = JSON.parse(localStorage.getItem(`nutri_${todayStr}`) || '{"cals":0,"protein":0,"carbs":0,"fat":0}');
            
            current.cals += recipe.calories;
            current.carbs += recipe.carbs;
            current.protein += recipe.protein;
            current.fat += recipe.fat;

            localStorage.setItem(`nutri_${todayStr}`, JSON.stringify(current));
        }

        // ==============================================
        // OPTION 2 - CAMERA DETECT-INGREDIENTS VIA FILE UPLOAD
        // ==============================================
        
        function openCameraScan() {
            openModal('modalCamera');
        }

        function previewImageFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('scannedImagePreview').src = e.target.result;
                document.getElementById('btnScanImage').disabled = false;
            };
            reader.readAsDataURL(file);
        }

        async function uploadAndDetectImage() {
            const fileInput = document.getElementById('cameraFileInput');
            const file = fileInput.files[0];
            if (!file) return;

            // Show scanner laser animation overlay
            document.getElementById('laserScanner').style.display = 'block';
            document.getElementById('btnScanImage').disabled = true;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_URL}/ai/detect-ingredients`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: formData
                });

                const data = await response.json();
                
                // Hide scanning animations
                document.getElementById('laserScanner').style.display = 'none';
                closeModal('modalCamera');

                if (data.success && data.detected_items && data.detected_items.length > 0) {
                    showLoader(true);
                    
                    // Call backend /api/inventory for each item in batch
                    const promises = data.detected_items.map(item => {
                        const expDate = new Date();
                        expDate.setDate(expDate.getDate() + (item.expiry_days || 7));
                        const expDateStr = expDate.toISOString().split('T')[0];

                        return fetch(`${API_URL}/inventory`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            },
                            body: JSON.stringify({
                                name: item.name,
                                quantity: item.quantity,
                                unit: item.unit,
                                expiry_date: expDateStr,
                                category: item.category
                            })
                        });
                    });

                    await Promise.all(promises);
                    showToast(`AI mendeteksi & menambahkan ${data.detected_items.length} bahan makanan!`);
                    await initApp();
                } else {
                    // Check if fallback mock was triggered
                    if (data.message && data.message.includes('Simulated')) {
                        // The backend returned fallback simulated data
                        showLoader(true);
                        const promises = data.detected_items.map(item => {
                            const expDate = new Date();
                            expDate.setDate(expDate.getDate() + (item.expiry_days || 7));
                            const expDateStr = expDate.toISOString().split('T')[0];

                            return fetch(`${API_URL}/inventory`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                                },
                                body: JSON.stringify({
                                    name: item.name,
                                    quantity: item.quantity,
                                    unit: item.unit,
                                    expiry_date: expDateStr,
                                    category: item.category
                                })
                            });
                        });

                        await Promise.all(promises);
                        showToast(`Mode Simulasi: Berhasil menambahkan bahan makanan simulasi.`);
                        await initApp();
                    } else {
                        showToast("AI gagal mengenali bahan makanan atau gambar kurang jelas.", "red");
                    }
                }
            } catch (err) {
                console.error("Image scanning error:", err);
                document.getElementById('laserScanner').style.display = 'none';
                closeModal('modalCamera');
                showToast("Server AI offline. Menjalankan simulasi lokal...", "yellow");
                runOfflineMockCameraScan();
            } finally {
                showLoader(false);
            }
        }

        // Offline mock camera scanner
        async function runOfflineMockCameraScan() {
            showLoader(true);
            const mockDetected = [
                { name: 'Telur', category: 'Daging & Telur', unit: 'pcs', quantity: 4, expiry_days: 10 },
                { name: 'Cabai Merah', category: 'Sayuran', unit: 'gr', quantity: 100, expiry_days: 3 }
            ];

            const promises = mockDetected.map(item => {
                const expDate = new Date();
                expDate.setDate(expDate.getDate() + item.expiry_days);
                const expDateStr = expDate.toISOString().split('T')[0];

                return fetch(`${API_URL}/inventory`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        expiry_date: expDateStr,
                        category: item.category
                    })
                });
            });

            await Promise.all(promises);
            showToast("Simulasi Offline: Menambahkan Telur (4 pcs) & Cabai Merah (100 gr)!");
            await initApp();
        }

        // ==============================================
        // OPTION 2 - WEB SPEECH VOICE SCANNER (Zero Setup Voice)
        // ==============================================
        
        let voiceActionType = 'add'; // 'add' or 'delete'
        let voiceItemsToProcess = []; // Array of items to add or delete

        function openVoiceScan() {
            openModal('modalVoice');
            document.getElementById('transcriptBox').innerText = 'Ketuk ikon mic untuk mulai berbicara...';
            
            const applyBtn = document.getElementById('btnApplyVoice');
            applyBtn.disabled = true;
            applyBtn.innerText = "Tambahkan Bahan";
            applyBtn.style.backgroundColor = "";
            applyBtn.style.borderColor = "";
            
            voiceActionType = 'add';
            voiceItemsToProcess = [];
            parsedVoiceIngredientsData = {};
        }

        function toggleLiveSpeechRecording() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Browser Anda tidak mendukung Web Speech API (Gunakan Google Chrome atau Microsoft Edge untuk fitur ini).");
                return;
            }

            const micBtn = document.getElementById('micBtnContainer');
            const statusLabel = document.getElementById('recorderStatus');
            const transcriptBox = document.getElementById('transcriptBox');

            if (isLiveSpeechRecordingActive) {
                stopLiveSpeechRecording();
            } else {
                // Start Speech recognition
                isLiveSpeechRecordingActive = true;
                micBtn.classList.add('recording');
                statusLabel.innerText = "Mendengarkan... Silakan berbicara";
                statusLabel.classList.add('recording');
                transcriptBox.innerText = "Bicaralah sekarang...";

                liveSpeechRecognitionInstance = new SpeechRecognition();
                liveSpeechRecognitionInstance.lang = 'id-ID'; // Indonesian Language input
                liveSpeechRecognitionInstance.interimResults = false;
                liveSpeechRecognitionInstance.maxAlternatives = 1;

                liveSpeechRecognitionInstance.onresult = function(event) {
                    const text = event.results[0][0].transcript;
                    transcriptBox.innerText = `"${text}"`;
                    
                    // Parse text on client-side using JavaScript
                    parseSpeechTranscriptClientSide(text);
                };

                liveSpeechRecognitionInstance.onspeechend = function() {
                    stopLiveSpeechRecording();
                };

                liveSpeechRecognitionInstance.onerror = function(event) {
                    console.error("Speech Recognition Error:", event.error);
                    stopLiveSpeechRecording();
                    statusLabel.innerText = "Error perekaman. Silakan coba lagi.";
                };

                liveSpeechRecognitionInstance.start();
            }
        }

        function stopLiveSpeechRecording() {
            const micBtn = document.getElementById('micBtnContainer');
            const statusLabel = document.getElementById('recorderStatus');

            if (liveSpeechRecognitionInstance) {
                liveSpeechRecognitionInstance.stop();
                liveSpeechRecognitionInstance = null;
            }

            isLiveSpeechRecordingActive = false;
            micBtn.classList.remove('recording');
            statusLabel.innerText = "Ketuk ikon mic untuk mulai merekam";
            statusLabel.classList.remove('recording');
        }

        // JS client-side transcript parser equivalent to Python logic
        function parseSpeechTranscriptClientSide(text) {
            const INGREDIENTS_DB_KEYS = {
                "telur":        {"name": "Telur",        "category": "Daging & Telur", "unit": "pcs", "default_qty": 4,  "expiry_days": 14},
                "bawang merah": {"name": "Bawang Merah",  "category": "Bumbu",         "unit": "gr",  "default_qty": 100,"expiry_days": 14},
                "bawang putih": {"name": "Bawang Putih",  "category": "Bumbu",         "unit": "gr",  "default_qty": 50, "expiry_days": 20},
                "cabai":        {"name": "Cabai Merah",   "category": "Sayuran",       "unit": "gr",  "default_qty": 80, "expiry_days": 5},
                "bayam":        {"name": "Bayam",         "category": "Sayuran",       "unit": "gr",  "default_qty": 250,"expiry_days": 2},
                "ayam":         {"name": "Daging Ayam",   "category": "Daging & Telur","unit": "gr",  "default_qty": 500,"expiry_days": 3},
                "minyak":       {"name": "Minyak Goreng", "category": "Minyak & Lemak","unit": "ml",  "default_qty": 1000,"expiry_days": 180},
                "kecap":        {"name": "Kecap Manis",   "category": "Bumbu",         "unit": "ml",  "default_qty": 200,"expiry_days": 90},
                "wortel":       {"name": "Wortel",        "category": "Sayuran",       "unit": "gr",  "default_qty": 200,"expiry_days": 7},
                "kentang":      {"name": "Kentang",       "category": "Sayuran",       "unit": "gr",  "default_qty": 500,"expiry_days": 20},
                "tomat":        {"name": "Tomat",         "category": "Sayuran",       "unit": "gr",  "default_qty": 150,"expiry_days": 5},
                "apel":         {"name": "Apel",          "category": "Buah",          "unit": "pcs", "default_qty": 3,  "expiry_days": 7},
                "pisang":       {"name": "Pisang",        "category": "Buah",          "unit": "pcs", "default_qty": 5,  "expiry_days": 4},
                "jeruk":        {"name": "Jeruk",         "category": "Buah",          "unit": "pcs", "default_qty": 4,  "expiry_days": 7},
                "brokoli":      {"name": "Brokoli",       "category": "Sayuran",       "unit": "gr",  "default_qty": 300,"expiry_days": 5},
                "sawi":         {"name": "Sawi",          "category": "Sayuran",       "unit": "gr",  "default_qty": 200,"expiry_days": 3},
                "jahe":         {"name": "Jahe",          "category": "Bumbu",         "unit": "gr",  "default_qty": 50,  "expiry_days": 14},
                "kunyit":       {"name": "Kunyit",        "category": "Bumbu",         "unit": "gr",  "default_qty": 30,  "expiry_days": 14},
                "santan":       {"name": "Santan",        "category": "Bumbu",         "unit": "ml",  "default_qty": 200,"expiry_days": 7},
                "tempe":        {"name": "Tempe",         "category": "Protein Nabati","unit": "gr",  "default_qty": 250,"expiry_days": 5},
                "tahu":         {"name": "Tahu",          "category": "Protein Nabati","unit": "gr",  "default_qty": 250,"expiry_days": 3},
            };

            const textLower = text.toLowerCase();
            const isDeleteAction = /hapus|buang|keluarkan|delete|remove/i.test(textLower);
            
            voiceActionType = isDeleteAction ? 'delete' : 'add';
            voiceItemsToProcess = [];

            if (isDeleteAction) {
                // Find matching ingredients currently in the fridge
                Object.entries(INGREDIENTS_DB_KEYS).forEach(([keyword, info]) => {
                    if (textLower.includes(keyword)) {
                        // Find matching item in fridgeData
                        const matchedInFridge = fridgeData.filter(item => 
                            item.name.toLowerCase().includes(keyword) || 
                            keyword.includes(item.name.toLowerCase())
                        );
                        matchedInFridge.forEach(item => {
                            if (!voiceItemsToProcess.some(x => x.id === item.id)) {
                                voiceItemsToProcess.push(item);
                            }
                        });
                    }
                });

                const applyBtn = document.getElementById('btnApplyVoice');
                if (voiceItemsToProcess.length > 0) {
                    applyBtn.disabled = false;
                    applyBtn.innerText = "Hapus Bahan";
                    applyBtn.style.backgroundColor = "var(--accent-red)";
                    applyBtn.style.borderColor = "var(--accent-red)";
                    
                    document.getElementById('transcriptBox').innerHTML += `
                        <div style="margin-top: 14px; text-align: left; background: rgba(239, 68, 68, 0.05); border: 1px dashed var(--accent-red); padding: 12px; border-radius: 8px; font-size: 13px;">
                            <strong style="color: var(--accent-red); display: block; margin-bottom: 6px;"><i class="fa-solid fa-trash-can"></i> AI Mendeteksi Perintah Hapus:</strong>
                            ${voiceItemsToProcess.map(item => `• ${item.name} (${item.quantity} ${item.unit})`).join('<br>')}
                        </div>
                    `;
                } else {
                    applyBtn.disabled = true;
                    applyBtn.innerText = "Hapus Bahan";
                    applyBtn.style.backgroundColor = "var(--accent-red)";
                    applyBtn.style.borderColor = "var(--accent-red)";
                    document.getElementById('transcriptBox').innerHTML += `<p style="color: var(--accent-red); font-size: 12px; margin-top: 10px;">Bahan yang ingin dihapus tidak ditemukan di kulkas Anda.</p>`;
                }
            } else {
                // Standard ADD flow
                const numPattern = '(\\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|seratus|dua ratus|tiga ratus|empat ratus|lima ratus|setengah)';
                const unitPattern = '(gram|gr|g|kg|kilo|kilogram|ml|mili|mililiter|liter|l|lt|butir|telur|telor|buah|biji|pcs|siung|ikat)';
                
                const tempParsed = {};
                Object.entries(INGREDIENTS_DB_KEYS).forEach(([keyword, info]) => {
                    if (!textLower.includes(keyword)) return;

                    const regexAfter = new RegExp(`${escapeRegExp(keyword)}\\s+(?:ada|sebanyak|sekitar\\s+)?\\s*${numPattern}\\s*${unitPattern}?`, 'i');
                    const matchAfter = textLower.match(regexAfter);

                    const regexBefore = new RegExp(`${numPattern}\\s*${unitPattern}?\\s+(?:dari|berupa\\s+)?\\s*${escapeRegExp(keyword)}`, 'i');
                    const matchBefore = textLower.match(regexBefore);

                    const match = matchAfter || matchBefore;
                    if (match) {
                        const qtyStr = match[1];
                        const unitStr = match[2] || null;

                        let qty = jsParseNumberWord(qtyStr);
                        let unit;
                        [qty, unit] = jsNormalizeQtyAndUnit(qty, unitStr, info.unit);

                        tempParsed[keyword] = {
                            name: info.name,
                            quantity: Math.round(qty),
                            unit: unit,
                            category: info.category,
                            expiry_days: info.expiry_days
                        };
                    } else {
                        tempParsed[keyword] = {
                            name: info.name,
                            quantity: info.default_qty,
                            unit: info.unit,
                            category: info.category,
                            expiry_days: info.expiry_days
                        };
                    }
                });

                voiceItemsToProcess = Object.values(tempParsed);
                const applyBtn = document.getElementById('btnApplyVoice');
                if (voiceItemsToProcess.length > 0) {
                    applyBtn.disabled = false;
                    applyBtn.innerText = "Tambahkan Bahan";
                    applyBtn.style.backgroundColor = "";
                    applyBtn.style.borderColor = "";
                    
                    document.getElementById('transcriptBox').innerHTML += `
                        <div style="margin-top: 14px; text-align: left; background: rgba(16, 185, 129, 0.05); border: 1px dashed var(--accent-green); padding: 12px; border-radius: 8px; font-size: 13px;">
                            <strong style="color: var(--accent-green); display: block; margin-bottom: 6px;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Mengekstrak:</strong>
                            ${voiceItemsToProcess.map(item => `• ${item.name} (${item.quantity} ${item.unit})`).join('<br>')}
                        </div>
                    `;
                } else {
                    applyBtn.disabled = true;
                    applyBtn.innerText = "Tambahkan Bahan";
                    applyBtn.style.backgroundColor = "";
                    applyBtn.style.borderColor = "";
                    document.getElementById('transcriptBox').innerHTML += `<p style="color: var(--accent-red); font-size: 12px; margin-top: 10px;">Gagal mengenali kosa kata bahan makanan dari transkrip.</p>`;
                }
            }
        }

        // Helper word parser JS
        function jsParseNumberWord(word) {
            word = word.trim().toLowerCase();
            if (/^\d+$/.test(word)) return parseFloat(word);

            const map = {
                "setengah": 0.5, "satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5,
                "enam": 6, "tujuh": 7, "delapan": 8, "sembilan": 9, "sepuluh": 10,
                "sebelas": 11, "seratus": 100, "dua ratus": 200, "tiga ratus": 300,
                "empat ratus": 400, "lima ratus": 500
            };
            return map[word] !== undefined ? map[word] : 1;
        }

        // Helper unit normalizer JS
        function jsNormalizeQtyAndUnit(qty, unitStr, defaultUnit) {
            if (!unitStr) return [qty, defaultUnit];
            unitStr = unitStr.trim().toLowerCase();

            if (["kg", "kilo", "kilogram"].includes(unitStr)) return [qty * 1000, "gr"];
            if (["gram", "gr", "g"].includes(unitStr)) return [qty, "gr"];
            if (["liter", "l", "lt"].includes(unitStr)) return [qty * 1000, "ml"];
            if (["ml", "mili", "mililiter"].includes(unitStr)) return [qty, "ml"];
            if (["butir", "telur", "telor", "buah", "biji", "pcs", "siung"].includes(unitStr)) return [qty, "pcs"];
            
            return [qty, defaultUnit];
        }

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // Apply voice transcription parsed result to DB
        async function applyTranscriptResult() {
            if (voiceItemsToProcess.length === 0) return;

            closeModal('modalVoice');
            showLoader(true);

            try {
                const headers = {};
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (csrfMeta) {
                    headers['X-CSRF-TOKEN'] = csrfMeta.getAttribute('content');
                }

                if (voiceActionType === 'delete') {
                    const promises = voiceItemsToProcess.map(item => {
                        return fetch(`${API_URL}/inventory/${item.id}`, {
                            method: 'DELETE',
                            headers: headers
                        });
                    });
                    await Promise.all(promises);
                    showToast(`Berhasil mengeluarkan ${voiceItemsToProcess.length} bahan makanan dari kulkas.`);
                } else {
                    const promises = voiceItemsToProcess.map(item => {
                        const expDate = new Date();
                        expDate.setDate(expDate.getDate() + item.expiry_days);
                        const expDateStr = expDate.toISOString().split('T')[0];

                        headers['Content-Type'] = 'application/json';

                        return fetch(`${API_URL}/inventory`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({
                                name: item.name,
                                quantity: item.quantity,
                                unit: item.unit,
                                expiry_date: expDateStr,
                                category: item.category
                            })
                        });
                    });
                    await Promise.all(promises);
                    showToast(`Berhasil menambahkan ${voiceItemsToProcess.length} bahan makanan dari transkrip suara.`);
                }
                await initApp();
            } catch (err) {
                console.error("Voice apply error:", err);
                showToast("Gagal memproses bahan dari suara.", "red");
            } finally {
                showLoader(false);
            }
        }

        // Register PWA Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered successfully.', reg))
                    .catch(err => console.error('Service Worker registration failed.', err));
            });
        }
    </script>
</body>
</html>
