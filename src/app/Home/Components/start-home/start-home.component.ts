/**
 * ERP/Finance Dashboard - Complete TypeScript Implementation
 * Vanilla TypeScript with Canvas animations and DOM manipulation
 */

import { Component, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../Shared/Pipes/translate.pipe';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { I18nService } from '../../../Shared/Services/i18n.service';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Canvas animation configuration
 */
interface CanvasConfig {
    readonly heightMultiplier: number;
    readonly circleCount: number;
    readonly squareCount: number;
    readonly timeIncrement: number;
}

/**
 * Animation state
 */
interface AnimationState {
    time: number;
    animationId: number | null;
}

/**
 * Circle properties
 */
interface CircleProperties {
    x: number;
    y: number;
    radius: number;
    fillOpacity: number;
    strokeOpacity: number;
}

/**
 * Square properties
 */
interface SquareProperties {
    x: number;
    y: number;
    size: number;
    rotation: number;
    fillOpacity: number;
    strokeOpacity: number;
}

/**
 * Color configuration
 */
interface ColorConfig {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

/**
 * Animation configuration
 */
interface AnimationConfig {
    readonly circleColor: ColorConfig;
    readonly squareColor: ColorConfig;
    readonly circleOpacityRange: {
        readonly min: number;
        readonly max: number;
    };
    readonly squareOpacityRange: {
        readonly min: number;
        readonly max: number;
    };
}

/**
 * Feature card interface
 */
interface Feature {
    title: string;
    description: string;
    icon: string;
}

/**
 * Statistics card interface
 */
interface Stat {
    label: string;
    value: string;
    color: string;
}

// ============================================
// CONSTANTS
// ============================================

const CANVAS_CONFIG: CanvasConfig = {
    heightMultiplier: 0.6,
    circleCount: 5,
    squareCount: 4,
    timeIncrement: 0.01,
} as const;

const ANIMATION_CONFIG: AnimationConfig = {
    circleColor: { r: 34, g: 197, b: 94 },
    squareColor: { r: 59, g: 130, b: 246 },
    circleOpacityRange: { min: 0.1, max: 0.15 },
    squareOpacityRange: { min: 0.08, max: 0.12 },
} as const;

const FEATURES: Feature[] = [
    {
        title: "Real-time Analytics",
        description: "Track your financial metrics in real-time with interactive dashboards",
        icon: "chart-bars",
    },
    {
        title: "Budget Planning",
        description: "Create and manage budgets with intelligent forecasting tools",
        icon: "pie-chart",
    },
    {
        title: "Growth Insights",
        description: "Identify trends and opportunities with AI-powered analysis",
        icon: "trending-up",
    },
];

const STATS: Stat[] = [
    { label: "Active Users", value: "10K+", color: "#22c55e" },
    { label: "Uptime", value: "99.9%", color: "#3b82f6" },
    { label: "Support", value: "24/7", color: "#06b6d4" },
];

const CHART_DATA: number[] = [40, 60, 45, 75, 55, 80, 65];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate circle properties
 */
function calculateCircleProperties(
    index: number,
    time: number,
    canvasWidth: number,
    canvasHeight: number
): CircleProperties {
    const x = (canvasWidth / 5) * index + Math.sin(time + index) * 50;
    const y = canvasHeight / 2 + Math.cos(time * 0.7 + index) * 80;
    const radius = 30 + Math.sin(time * 0.5 + index) * 15;
    const fillOpacity = 0.1 + Math.sin(time + index) * 0.05;
    const strokeOpacity = 0.3 + Math.sin(time + index) * 0.1;

    return { x, y, radius, fillOpacity, strokeOpacity };
}

/**
 * Calculate square properties
 */
function calculateSquareProperties(
    index: number,
    time: number,
    canvasWidth: number,
    canvasHeight: number
): SquareProperties {
    const x = (canvasWidth / 4) * index + Math.cos(time * 0.6 + index) * 60;
    const y = canvasHeight / 3 + Math.sin(time * 0.8 + index) * 70;
    const size = 40 + Math.cos(time * 0.5 + index) * 15;
    const rotation = time * 0.5 + index;
    const fillOpacity = 0.08 + Math.cos(time + index) * 0.04;
    const strokeOpacity = 0.25 + Math.cos(time + index) * 0.1;

    return { x, y, size, rotation, fillOpacity, strokeOpacity };
}

/**
 * Convert RGB to RGBA string
 */
function colorToRgba(color: ColorConfig, opacity: number): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Debounce function
 */
function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * Throttle function
 */
function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function (...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// ============================================
// CANVAS ANIMATION
// ============================================

/**
 * Initialize canvas animation
 */
function initializeCanvasAnimation(): void {
    const canvas = document.getElementById("animationCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = (): void => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * CANVAS_CONFIG.heightMultiplier;
    };

    resizeCanvas();

    // Animation state
    const animationState: AnimationState = {
        time: 0,
        animationId: null,
    };

    // Draw circles
    const drawCircles = (): void => {
        for (let i = 0; i < CANVAS_CONFIG.circleCount; i++) {
            const { x, y, radius, fillOpacity, strokeOpacity } = calculateCircleProperties(
                i,
                animationState.time,
                canvas.width,
                canvas.height
            );

            ctx.fillStyle = colorToRgba(ANIMATION_CONFIG.circleColor, fillOpacity);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = colorToRgba(ANIMATION_CONFIG.circleColor, strokeOpacity);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };

    // Draw squares
    const drawSquares = (): void => {
        for (let i = 0; i < CANVAS_CONFIG.squareCount; i++) {
            const { x, y, size, rotation, fillOpacity, strokeOpacity } = calculateSquareProperties(
                i,
                animationState.time,
                canvas.width,
                canvas.height
            );

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.fillStyle = colorToRgba(ANIMATION_CONFIG.squareColor, fillOpacity);
            ctx.fillRect(-size / 2, -size / 2, size, size);

            ctx.strokeStyle = colorToRgba(ANIMATION_CONFIG.squareColor, strokeOpacity);
            ctx.lineWidth = 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);

            ctx.restore();
        }
    };

    // Animation loop
    const animate = (): void => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationState.time += CANVAS_CONFIG.timeIncrement;

        drawCircles();
        drawSquares();

        animationState.animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = debounce((): void => {
        resizeCanvas();
    }, 250);

    window.addEventListener("resize", handleResize);

    // Cleanup
    const cleanup = (): void => {
        if (animationState.animationId !== null) {
            cancelAnimationFrame(animationState.animationId);
        }
        window.removeEventListener("resize", handleResize);
    };

    // Store cleanup function for later
    (window as any).__canvasCleanup = cleanup;
}

// ============================================
// CHART INITIALIZATION
// ============================================

/**
 * Initialize chart bars
 */
function initializeChartBars(): void {
    const chartBars = document.getElementById("chartBars");
    if (!chartBars) return;

    CHART_DATA.forEach((height, i) => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = height + "%";
        bar.style.animationDelay = i * 0.1 + "s";
        chartBars.appendChild(bar);
    });
}

/**
 * Initialize a simple finance line chart on canvas#financeChart
 */
function initializeFinanceChart(): void {
    const canvas = document.getElementById('financeChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // set size to match computed style (responsive)
    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(300, Math.floor(rect.width));
        canvas.height = Math.max(150, Math.floor(rect.height));
        draw();
    };

    const draw = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // compute bounds
        const data = CHART_DATA.slice();
        const max = Math.max(...data, 100);

        // padding
        const pad = 24;
        const innerW = w - pad * 2;
        const innerH = h - pad * 2;

        // draw grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad + (innerH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad, y + 0.5);
            ctx.lineTo(pad + innerW, y + 0.5);
            ctx.stroke();
        }

        // draw line
        ctx.strokeStyle = 'rgba(34,197,94,0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = pad + (innerW * i) / (data.length - 1);
            const y = pad + innerH - (val / max) * innerH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // draw points
        ctx.fillStyle = 'rgba(59,130,246,0.95)';
        data.forEach((val, i) => {
            const x = pad + (innerW * i) / (data.length - 1);
            const y = pad + innerH - (val / max) * innerH;
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // draw labels (monthly simple)
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '12px Arial';
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        labels.forEach((lab, i) => {
            const x = pad + (innerW * i) / (labels.length - 1);
            ctx.fillText(lab, x - 10, h - 6);
        });
    };

    // initial draw
    resize();

    // redraw on window resize (debounced)
    const handleResize = debounce(() => resize(), 150);
    window.addEventListener('resize', handleResize);

    // store cleanup
    const cleanup = () => {
        window.removeEventListener('resize', handleResize);
    };

    (window as any).__financeChartCleanup = cleanup;
}

// ============================================
// NAVIGATION
// ============================================

/**
 * Initialize smooth scroll navigation
 */
function initializeSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (this: HTMLAnchorElement, e: Event) {
            e.preventDefault();
            const href = this.getAttribute("href");
            if (!href) return;

            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

// ============================================
// BUTTON INTERACTIONS
// ============================================

/**
 * Initialize button interactions
 */
function initializeButtons(): void {
    const buttons = document.querySelectorAll<HTMLElement>(".btn");

    buttons.forEach((btn) => {
        btn.addEventListener("click", function (this: HTMLElement, _e: Event) {
            const text = this.textContent?.trim() || "Button";
            console.log("Button clicked:", text);

            // Add ripple effect
            const ripple = document.createElement("span");
            ripple.style.position = "absolute";
            ripple.style.borderRadius = "50%";
            ripple.style.background = "rgba(255, 255, 255, 0.6)";
            ripple.style.width = "20px";
            ripple.style.height = "20px";
            ripple.style.animation = "ripple 0.6s ease-out";

            this.style.position = "relative";
            this.style.overflow = "hidden";
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ============================================
// INTERSECTION OBSERVER
// ============================================

/**
 * Initialize intersection observer for scroll animations
 */
function initializeIntersectionObserver(): void {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    });

    document.querySelectorAll<HTMLElement>(".feature-card").forEach((card) => {
        observer.observe(card);
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Monitor animation performance
 */
function monitorPerformance(): void {
    if (!window.requestAnimationFrame) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = (): void => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
            console.log(`FPS: ${frameCount}`);
            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(measureFPS);
    };

    // Uncomment to enable FPS monitoring
    // measureFPS();
}

// Scroll-jump behavior removed — normal scrolling allowed

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all components
 */
function initializeApp(): void {
    console.log("Initializing ERP/Finance Dashboard...");

    // Initialize canvas animation
    initializeCanvasAnimation();

    // Initialize chart
    initializeChartBars();

    // Initialize finance canvas chart
    initializeFinanceChart();

    // Initialize navigation
    initializeSmoothScroll();

    // Initialize buttons
    initializeButtons();

    // Initialize intersection observer
    initializeIntersectionObserver();

    // Monitor performance
    monitorPerformance();

    console.log("App initialized successfully!");
}

// ============================================
// DOCUMENT READY
// ============================================

/**
 * Run initialization when DOM is ready
 */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}

// ============================================
// CLEANUP
// ============================================

/**
 * Cleanup on page unload
 */
window.addEventListener("beforeunload", () => {
    if ((window as any).__canvasCleanup) {
        (window as any).__canvasCleanup();
    }
});

// ============================================
// EXPORTS (for module usage)
// ============================================

@Component({
    selector: 'app-start-home',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './start-home.component.html',
    styleUrls: ['./start-home.component.scss'],
})
export class StartHomeComponent implements AfterViewInit, OnDestroy {
    private _styleEl: HTMLStyleElement | null = null;
 @Output() languageToggle = new EventEmitter<void>();
 currentLang$: Observable<string>;
   isRTL$: Observable<boolean>;
    constructor(private router: Router,private i18nService: I18nService) { 
        this.currentLang$ = this.i18nService.currentLang$;
        this.isRTL$ = this.i18nService.currentLang$.pipe(
          map(lang => lang === 'ar')
        );}

    ngAfterViewInit(): void {
        // hide global sidebar while this page is active by adding a body class
        document.body.classList.add('start-home-active');
        // also mark the <html> element so global styles that target html can be overridden
        document.documentElement.classList.add('start-home-active');

        // inject a small stylesheet that hides the `app-sidebar` when active
        this._styleEl = document.createElement('style');
        this._styleEl.textContent = `
            /* hide layout chrome for landing */
            html.start-home-active app-sidebar, body.start-home-active app-sidebar { display: none !important; }
            html.start-home-active .top-navbar, body.start-home-active .top-navbar { display: none !important; }
            html.start-home-active .main-content-area, body.start-home-active .main-content-area { margin-left: 0 !important; }

            /* allow normal window scrolling while landing page is active */
            html.start-home-active, body.start-home-active, html.start-home-active .erp-layout, body.start-home-active .erp-layout {
                overflow: auto !important;
                height: auto !important;
            }
            html.start-home-active .main-content-area, body.start-home-active .main-content-area {
                overflow: visible !important;
                height: auto !important;
            }
            html.start-home-active .dashboard-content, body.start-home-active .dashboard-content {
                overflow: visible !important;
                height: auto !important;
            }
        `;
        document.head.appendChild(this._styleEl);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    }

    ngOnDestroy(): void {
        // remove injected style and body class
        if (this._styleEl && this._styleEl.parentNode) {
            this._styleEl.parentNode.removeChild(this._styleEl);
            this._styleEl = null;
        }
        document.body.classList.remove('start-home-active');
        document.documentElement.classList.remove('start-home-active');

        // call any existing cleanup hooks
        if ((window as any).__canvasCleanup) {
            (window as any).__canvasCleanup();
        }
        if ((window as any).__financeChartCleanup) {
            (window as any).__financeChartCleanup();
        }
    }

    // Scroll controls used by the floating buttons in the template
    scrollDown(): void {
        try {
            window.scrollBy({ top: Math.max(window.innerHeight * 0.9, 300), behavior: 'smooth' });
        } catch (e) {
            window.scrollTo(0, window.scrollY + Math.max(window.innerHeight * 0.9, 300));
        }
    }

    scrollUp(): void {
        try {
            window.scrollBy({ top: -Math.max(window.innerHeight * 0.9, 300), behavior: 'smooth' });
        } catch (e) {
            window.scrollTo(0, Math.max(0, window.scrollY - Math.max(window.innerHeight * 0.9, 300)));
        }
    }

    goHome(): void {
        // navigate to main dashboard (projects) — adjusts to your routing default
        this.router.navigate(['/projects']);
    }
    toggleLanguage(): void {
        console.log("button click")
    this.languageToggle.emit();
  }
   gotoDashboard(): void {
        // navigate to the project dashboard route
        this.router.navigate(['/dashboard']);
    }

}

export {
    CanvasConfig,
    AnimationState,
    CircleProperties,
    SquareProperties,
    ColorConfig,
    AnimationConfig,
    Feature,
    Stat,
    calculateCircleProperties,
    calculateSquareProperties,
    colorToRgba,
    clamp,
    debounce,
    throttle,
    initializeCanvasAnimation,
    initializeChartBars,
    initializeSmoothScroll,
    initializeButtons,
    initializeIntersectionObserver,
    monitorPerformance,
    initializeApp,
};