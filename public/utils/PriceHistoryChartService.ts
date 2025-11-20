export class PriceHistoryChartService {
    private static chartInstance: any = null;

    static async initChart(containerId: string, priceHistory: Array<{ date: string; price: number }>): Promise<void> {
        const canvas = document.getElementById(containerId) as HTMLCanvasElement | null;
        if (!canvas) {
            console.error(`Canvas с ID "${containerId}" не найден`);
            return;
        }

        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Не удалось получить контекст 2D');
            return;
        }

        const sortedData = [...priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (sortedData.length > 0 && sortedData[sortedData.length - 1].date !== todayStr) {
            sortedData.push({
                date: todayStr,
                price: sortedData[sortedData.length - 1].price
            });
        }

        const padding = { top: 40, right: 30, bottom: 60, left: 60 };
        const width = canvas.width - padding.left - padding.right;
        const height = canvas.height - padding.top - padding.bottom;

        const prices = sortedData.map(d => d.price);
        let minPrice = Math.min(...prices);
        let maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            minPrice -= 1000;
            maxPrice += 1000;
        }

        const priceToY = (price: number) => {
            return height - ((price - minPrice) / (maxPrice - minPrice)) * height;
        };

        const startDate = new Date(sortedData[0].date);
        const endDate = new Date(sortedData[sortedData.length - 1].date);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        let dateFormat = 'day';
        if (totalDays > 90) dateFormat = 'month';
        if (totalDays > 730) dateFormat = 'year';

        const getMonthShortName = (monthIndex: number): string => {
            const months = ['янв.', 'фев.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сен.', 'окт.', 'нояб.', 'дек.'];
            return months[monthIndex];
        };

        const formatDate = (dateStr: string): string => {
            const date = new Date(dateStr);
            switch (dateFormat) {
                case 'day':
                    return `${date.getDate()} ${getMonthShortName(date.getMonth())}`;
                case 'month':
                    return `${getMonthShortName(date.getMonth())} ${date.getFullYear()}`;
                case 'year':
                    return `${date.getFullYear()}`;
                default:
                    return date.toLocaleDateString('ru-RU');
            }
        };

        const dateToX = (dateStr: string) => {
            const date = new Date(dateStr);
            const daysFromStart = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return (daysFromStart / totalDays) * width;
        };

        const COLORS = {
            background: '#f9fbfa',
            grid: '#cfd8dc',
            line: '#4CAF50',
            axisLabel: '#78909c',
            tooltipBg: '#fff',
            tooltipBorder: '#ddd',
            tooltipShadow: 'rgba(0,0,0,0.1)',
            tooltipText: '#333',
            tooltipSubtext: '#78909c',
            pointFill: '#4CAF50'
        };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;

        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = padding.top + (i / ySteps) * height;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(canvas.width - padding.right, y);
            ctx.stroke();

            const priceLabel = Math.round(minPrice + (i / ySteps) * (maxPrice - minPrice));
            ctx.fillStyle = COLORS.axisLabel;
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(priceLabel.toLocaleString('ru-RU'), padding.left - 10, y + 4);
        }

        const xSteps = Math.min(8, sortedData.length);
        const stepSize = Math.max(1, Math.floor(sortedData.length / xSteps));
        for (let i = 0; i < sortedData.length; i += stepSize) {
            const point = sortedData[i];
            const x = padding.left + dateToX(point.date);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, canvas.height - padding.bottom);
            ctx.stroke();

            const label = formatDate(point.date);
            ctx.fillStyle = COLORS.axisLabel;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, canvas.height - padding.bottom + 20);
        }

        const linePoints = sortedData.map((point, index) => ({
            x: padding.left + dateToX(point.date),
            y: padding.top + priceToY(point.price)
        }));

        const duration = 1200;
        let startTime: number | null = null;

        const animateLine = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            ctx.clearRect(padding.left - 5, padding.top - 5, width + 10, height + 10);
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;

            for (let i = 0; i <= ySteps; i++) {
                const y = padding.top + (i / ySteps) * height;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(canvas.width - padding.right, y);
                ctx.stroke();
            }
            for (let i = 0; i < sortedData.length; i += stepSize) {
                const x = padding.left + dateToX(sortedData[i].date);
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, canvas.height - padding.bottom);
                ctx.stroke();
            }

            if (linePoints.length > 1) {
                ctx.strokeStyle = COLORS.line;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();

                for (let i = 0; i < linePoints.length - 1; i++) {
                    const start = linePoints[i];
                    const end = linePoints[i + 1];

                    const segmentProgress = Math.min(Math.max((progress - i / (linePoints.length - 1)) * (linePoints.length - 1), 0), 1);
                    if (segmentProgress <= 0 && i > 0) {
                        ctx.lineTo(start.x, start.y);
                        continue;
                    }

                    if (i === 0) {
                        ctx.moveTo(start.x, start.y);
                    } else {
                        ctx.lineTo(start.x, start.y);
                    }

                    if (segmentProgress > 0) {
                        const x = start.x + (end.x - start.x) * segmentProgress;
                        const y = start.y + (end.y - start.y) * segmentProgress;
                        ctx.lineTo(x, y);
                        break;
                    }
                }

                ctx.stroke();
            }

            ctx.fillStyle = COLORS.pointFill;
            for (let i = 0; i < linePoints.length; i++) {
                const pointProgress = i / (linePoints.length - 1);
                if (progress >= pointProgress - 0.05) {
                    const p = linePoints[i];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animateLine);
            } else {
                this.chartInstance = {
                    destroy: () => {
                        canvas.removeEventListener('mousemove', this.handleMouseMove);
                        canvas.removeEventListener('mouseout', this.handleMouseOut);
                    }
                };

                this.setupTooltip(canvas, sortedData, padding, dateToX, priceToY, getMonthShortName, COLORS);
            }
        };

        requestAnimationFrame(animateLine);
    }

    private static setupTooltip(
        canvas: HTMLCanvasElement,
        sortedData: Array<{ date: string; price: number }>,
        padding: { top: number; right: number; bottom: number; left: number },
        dateToX: (dateStr: string) => number,
        priceToY: (price: number) => number,
        getMonthShortName: (monthIndex: number) => string,
        COLORS: { 
            tooltipBg: string; 
            tooltipBorder: string; 
            tooltipShadow: string; 
            tooltipText: string; 
            tooltipSubtext: string 
        }
    ) {
        let tooltip: HTMLElement | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - padding.left;
            const mouseY = e.clientY - rect.top - padding.top;

            let closestPoint = null;
            let minDist = Infinity;

            sortedData.forEach((point) => {
                const x = dateToX(point.date);
                const y = priceToY(point.price);
                const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
                if (dist < minDist && dist < 20) {
                    minDist = dist;
                    closestPoint = point;
                }
            });

            if (closestPoint) {
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.className = 'price-history-tooltip';
                    document.body.appendChild(tooltip);
                }

                const date = new Date(closestPoint.date);
                const formattedDate = `${date.getDate()} ${getMonthShortName(date.getMonth())} ${date.getFullYear()}`;
                tooltip.innerHTML = `
                    <div>${closestPoint.price.toLocaleString('ru-RU')} руб</div>
                    <div class="price-history-tooltip__date">${formattedDate}</div>
                `;
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY - 40}px`;
            } else if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        };

        const handleMouseOut = () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseout', handleMouseOut);

        (canvas as any)._tooltipHandlers = { handleMouseMove, handleMouseOut };
    }

    static destroyChart(): void {
        const canvas = document.getElementById('price-history-chart') as HTMLCanvasElement | null;
        if (canvas) {
            const handlers = (canvas as any)._tooltipHandlers;
            if (handlers) {
                canvas.removeEventListener('mousemove', handlers.handleMouseMove);
                canvas.removeEventListener('mouseout', handlers.handleMouseOut);
            }
        }
        this.chartInstance = null;
    }
}