export class PriceHistoryChartService {
    private static chartInstance: any = null;
    private static currentData: Array<{ date: string; price: number }> | null = null;
    private static currentContainerId: string | null = null;
    private static isRendering: boolean = false;

    static async initChart(containerId: string, priceHistory: Array<{ date: string; price: number }>): Promise<void> {
        if (this.isRendering) {
            return;
        }

        this.isRendering = true;
        try {
            this.destroyChart();

            const canvas = document.getElementById(containerId) as HTMLCanvasElement | null;
            if (!canvas) {
                return;
            }

            if (!(canvas instanceof HTMLCanvasElement)) {
                return;
            }

            this.currentContainerId = containerId;
            this.currentData = priceHistory;

            this.setFixedCanvasSize(canvas);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!priceHistory || priceHistory.length === 0) {
                this.renderNoDataMessage(canvas, ctx);
                return;
            }

            if (priceHistory.length === 1) {
                this.renderSinglePointMessage(canvas, ctx, priceHistory[0]);
                return;
            }

            await this.renderChart(canvas, ctx, priceHistory);

        } finally {
            this.isRendering = false;
        }
    }

    private static setFixedCanvasSize(canvas: HTMLCanvasElement): void {
        const container = canvas.parentElement;
        if (!container) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const fixedWidth = Math.max(containerRect.width, 300);
        const fixedHeight = 300;

        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.floor(fixedWidth * dpr);
        canvas.height = Math.floor(fixedHeight * dpr);
        canvas.style.width = `${fixedWidth}px`;
        canvas.style.height = `${fixedHeight}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }

    private static async renderChart(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        priceHistory: Array<{ date: string; price: number }>
    ): Promise<void> {
        const sortedData = [...priceHistory].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const uniqueData = this.removeDuplicates(sortedData);

        const dpr = window.devicePixelRatio || 1;
        const padding = { top: 50, right: 30, bottom: 50, left: 60 };
        const width = canvas.width / dpr - padding.left - padding.right;
        const height = canvas.height / dpr - padding.top - padding.bottom;

        const prices = uniqueData.map(d => d.price);
        let minPrice = Math.min(...prices);
        let maxPrice = Math.max(...prices);

        const priceRange = maxPrice - minPrice;
        if (priceRange === 0) {
            minPrice = Math.floor(minPrice * 0.9);
            maxPrice = Math.ceil(maxPrice * 1.1);
        } else {
            const roundedStep = this.calcRoundedStep(priceRange);
            minPrice = Math.floor(minPrice / roundedStep) * roundedStep;
            maxPrice = Math.ceil(maxPrice / roundedStep) * roundedStep;
        }

        const dates = uniqueData.map(d => new Date(d.date));
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        const totalTime = endDate.getTime() - startDate.getTime();

        const priceToY = (price: number) => {
            return padding.top + height - ((price - minPrice) / (maxPrice - minPrice)) * height;
        };

        const dateToX = (date: Date) => {
            const timeFromStart = date.getTime() - startDate.getTime();
            return padding.left + (timeFromStart / totalTime) * width;
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const COLORS = {
            background: '#ffffff',
            grid: '#e9ecef',
            axis: '#6c757d',
            line: '#1FBB72',
            area: 'rgba(31, 187, 114, 0.1)',
            point: '#1FBB72',
            pointHover: '#198754',
            text: '#495057',
            title: '#212529'
        };

        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        const yStepsCount = 5;
        const yStep = (maxPrice - minPrice) / yStepsCount;

        for (let i = 0; i <= yStepsCount; i++) {
            const price = minPrice + yStep * i;
            const y = priceToY(price);

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(canvas.width / dpr - padding.right, y);
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = COLORS.axis;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            ctx.fillText(price.toFixed(0), padding.left - 8, y);
        }

        const xSteps = Math.min(7, uniqueData.length);

        const indicesSet = new Set<number>();
        indicesSet.add(0);
        indicesSet.add(uniqueData.length - 1);
        for (let i = 0; i < xSteps; i++) {
            const idx = Math.floor((i / (xSteps - 1)) * (uniqueData.length - 1));
            indicesSet.add(idx);
        }
        const indices = Array.from(indicesSet).sort((a, b) => a - b);

        const usedMonthYearLabels = new Set<string>();

        indices.forEach(index => {
            const point = uniqueData[index];
            const x = dateToX(new Date(point.date));

            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, canvas.height / dpr - padding.bottom);
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = COLORS.axis;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            const monthYearLabel = this.formatMonthYear(point.date);
            const displayLabel = usedMonthYearLabels.has(monthYearLabel) ? '' : monthYearLabel;
            if (!usedMonthYearLabels.has(monthYearLabel)) {
                usedMonthYearLabels.add(monthYearLabel);
            }

            ctx.fillText(displayLabel, x, canvas.height / dpr - padding.bottom + 8);
        });

        ctx.fillStyle = COLORS.area;
        ctx.beginPath();
        ctx.moveTo(dateToX(dates[0]), priceToY(prices[0]));
        for (let i = 1; i < uniqueData.length; i++) {
            ctx.lineTo(dateToX(dates[i]), priceToY(prices[i]));
        }
        ctx.lineTo(dateToX(dates[dates.length - 1]), canvas.height / dpr - padding.bottom);
        ctx.lineTo(dateToX(dates[0]), canvas.height / dpr - padding.bottom);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(dateToX(dates[0]), priceToY(prices[0]));
        for (let i = 1; i < uniqueData.length; i++) {
            ctx.lineTo(dateToX(dates[i]), priceToY(prices[i]));
        }
        ctx.stroke();

        ctx.fillStyle = COLORS.point;
        for (let i = 0; i < uniqueData.length; i++) {
            ctx.beginPath();
            ctx.arc(dateToX(dates[i]), priceToY(prices[i]), 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        this.setupTooltip(canvas, uniqueData, dateToX, priceToY, padding, dpr);
    }

    private static calcRoundedStep(range: number): number {
        if (range <= 5) return 1;

        const order = Math.floor(Math.log10(range));
        const baseStep = Math.pow(10, order - 1);

        const steps = [1, 2, 5, 10].map(x => x * baseStep);

        for (const step of steps) {
            if (range / step <= 10) return step;
        }

        return baseStep;
    }

    private static removeDuplicates(data: Array<{ date: string; price: number }>): Array<{ date: string; price: number }> {
        const seen = new Set();
        return data.filter(item => {
            const key = `${item.date}_${item.price}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private static setupTooltip(
        canvas: HTMLCanvasElement,
        data: Array<{ date: string; price: number }>,
        dateToX: (date: Date) => number,
        priceToY: (price: number) => number,
        padding: { top: number; right: number; bottom: number; left: number },
        dpr: number
    ): void {
        let tooltip: HTMLElement | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width / dpr);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height / dpr);

            let closestPoint: any = null;
            let minDistance = Infinity;

            data.forEach((point, index) => {
                const pointX = dateToX(new Date(point.date));
                const pointY = priceToY(point.price);
                const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);

                if (distance < minDistance && distance < 25) {
                    minDistance = distance;
                    closestPoint = { ...point, index };
                }
            });

            if (closestPoint) {
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.className = 'price-history-tooltip';
                    tooltip.style.position = 'fixed';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.padding = '6px 10px';
                    tooltip.style.background = 'rgba(0, 0, 0, 0.75)';
                    tooltip.style.color = '#fff';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.fontSize = '12px';
                    tooltip.style.zIndex = '1000';
                    document.body.appendChild(tooltip);
                }

                const priceText = this.formatPriceWithoutCurrency(closestPoint.price);
                const formattedDate = this.formatDate(closestPoint.date, true);

                tooltip.innerHTML = `
                    <div>${priceText}</div>
                    <div>${formattedDate}</div>
                `;

                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;

                let left = e.clientX + 10;
                let top = e.clientY - tooltipHeight - 10;

                if (left + tooltipWidth > window.innerWidth) {
                    left = e.clientX - tooltipWidth - 10;
                }

                if (top < 0) {
                    top = e.clientY + 10;
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.display = 'block';
            } else if (tooltip) {
                tooltip.style.display = 'none';
            }
        };

        const handleMouseLeave = () => {
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        (canvas as any)._tooltipHandlers = { handleMouseMove, handleMouseLeave };
    }

    private static renderNoDataMessage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
        const dpr = window.devicePixelRatio || 1;
        const centerX = canvas.width / (2 * dpr);
        const centerY = canvas.height / (2 * dpr);

        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Нет данных об изменении цены', centerX, centerY);
    }

    private static renderSinglePointMessage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, point: { date: string; price: number }): void {
        const dpr = window.devicePixelRatio || 1;
        const centerX = canvas.width / (2 * dpr);
        const centerY = canvas.height / (2 * dpr);

        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Текущая цена: ${this.formatPriceWithoutCurrency(point.price)}`, centerX, centerY - 15);
        
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.fillText(`с ${this.formatDate(point.date, true)}`, centerX, centerY + 5);
    }

    private static formatPriceWithoutCurrency(price: number): string {
        return new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 0,
            useGrouping: true,
        }).format(price);
    }

    private static formatDate(dateString: string, full: boolean = false): string {
        const date = new Date(dateString);
        
        if (full) {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
    }

    private static formatMonthYear(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }).replace(' г.', '').toLowerCase();
    }

    static destroyChart(): void {
        const canvas = document.getElementById(this.currentContainerId ?? '') as HTMLCanvasElement | null;
        if (canvas) {
            const handlers = (canvas as any)._tooltipHandlers;
            if (handlers) {
                canvas.removeEventListener('mousemove', handlers.handleMouseMove);
                canvas.removeEventListener('mouseleave', handlers.handleMouseLeave);
            }

            const tooltip = document.querySelector('.price-history-tooltip');
            if (tooltip && tooltip.parentElement) {
                tooltip.parentElement.removeChild(tooltip);
            }
        }

        this.currentData = null;
        this.currentContainerId = null;
        this.isRendering = false;
    }
}
