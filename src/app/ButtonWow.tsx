import { useLayoutEffect } from "react";

export function ButtonWow(props: { isAnimating: boolean; value: string; onClick: () => void}) {

    useLayoutEffect(() => {
        const el = document.getElementById('canvas') as HTMLCanvasElement;
        if (el === null) {
            return;
        }
        const ctx = el.getContext('2d');
        if (ctx === null) {
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const pi = Math.PI;
        const points = 12;
        const radius = 60 * dpr;
        const h = 200 * dpr;
        const w = 200 * dpr;
        const center = {
            x: w / 2 * dpr, 
            y: h / 2 * dpr
        };
        const circles: {
            x: number;
            y: number;
            radian: number;
            range: number;
            phase: number;
        }[][] = [];
        const rangeMin = 5;
        const rangeMax = 15;
        const showPoints = true;
    
        let mouseY = 0;
        let tick = 0;
    
        const gradient1 = ctx.createLinearGradient(0, 0, w, 0);
        gradient1.addColorStop(0, '#96fbc4');
        gradient1.addColorStop(1, '#f9f586');
    
        const gradient2 = ctx.createLinearGradient(0, 0, w, 0);
        gradient2.addColorStop(0, '#48c6ef');
        gradient2.addColorStop(1, '#6f86d6');
    
        const gradient3 = ctx.createLinearGradient(0, 0, w, 0);
        gradient3.addColorStop(0, '#9795f0');
        gradient3.addColorStop(1, '#9be15d');
    
        const gradient4 = ctx.createLinearGradient(0, 0, w, 0);
        gradient4.addColorStop(0, '#f6d365');
        gradient4.addColorStop(1, '#fda085');
    
        const gradients = [ gradient1, gradient2, gradient3, gradient4 ];
    
        window.addEventListener('mousemove', handleMove, true);
    
        function handleMove(event: any) {
            mouseY = event.clientY;
        }
    
        ctx.scale(dpr, dpr);
    
        el.width = w * dpr;
        el.height = h * dpr;
        el.style.width = w + 'px';
        el.style.height = h + 'px';
    
        // Setup swing circle points
    
        for (var idx = 0; idx <= gradients.length - 1; idx++) {
        
            let swingpoints = [];
            let radian = 0;
    
            for (var i = 0; i < points; i++){
                radian = pi * 2 / points * i;
                var ptX = center.x + radius * Math.cos(radian);
                var ptY = center.y + radius * Math.sin(radian);
    
                swingpoints.push({ 
                    x: ptX,
                    y: ptY,
                    radian: radian,
                    range: random(rangeMin, rangeMax),
                    phase: 0 
                });
            }
        
            circles.push(swingpoints);
    
        }
    
        // --------------------------------------------------------------------------- //
        // swingCircle
    
        function swingCircle() {
            if (ctx === null) {
                return;
            }
            ctx.clearRect(0, 0, w * dpr, h * dpr);
            
            ctx.globalAlpha = 1;
            // ctx.globalCompositeOperation = 'source-over';
            ctx.globalCompositeOperation = 'screen';
            
            for (let k = 0; k < circles.length; k++) {
                let swingpoints = circles[k];
            
                for (var i = 0; i < swingpoints.length; i++){
                    swingpoints[i].phase += random(1, 10) * -0.01;
                    
                    let phase = 4 * Math.sin(tick / 65);
                    
                    if (mouseY !== 0) {
                        phase = mouseY / 200 + 1;
                    }
                    
                    var r = radius + (props.isAnimating ? 1 : 0.05) * (swingpoints[i].range * phase * Math.sin(swingpoints[i].phase) - rangeMax);
                    
                    swingpoints[i].radian += pi / 360;
                    
                    var ptX = center.x + r * Math.cos(swingpoints[i].radian);
                    var ptY = center.y + r * Math.sin(swingpoints[i].radian);
            
                    if (showPoints === true) {
                        ctx.strokeStyle = '#96fbc4';
    
                        ctx.beginPath();
                        ctx.arc(ptX, ptY, 2 * dpr, 0, pi * 2, true);
                        ctx.closePath();
                        ctx.stroke();
                    }
                        
                    swingpoints[i] = {
                        x: ptX,
                        y: ptY,
                        radian: swingpoints[i].radian,
                        range: swingpoints[i].range,
                        phase: swingpoints[i].phase,
                    };
                }
    
                const fill = gradients[k];
            
                drawCurve(swingpoints, fill);
            
            }
            
            tick++;
            
            requestAnimationFrame(swingCircle);
        }

        requestAnimationFrame(swingCircle);
    
    
        // --------------------------------------------------------------------------- //
        // drawCurve
    
        function drawCurve(pts: any, fillStyle: any) {
            if (ctx === null) {
                return;
            }
            ctx.fillStyle = fillStyle;
            ctx.beginPath();
            ctx.moveTo(
                (pts[cycle( - 1, points)].x + pts[0].x) / 2,
                (pts[cycle( - 1, points)].y + pts[0].y) / 2);
            for (var i = 0; i < pts.length; i++){
            
                ctx.quadraticCurveTo(
                    pts[i].x,
                    pts[i].y,
                    (pts[i].x + pts[cycle(i + 1, points)].x) / 2,
                    (pts[i].y + pts[cycle(i + 1, points)].y) / 2);
            }
        
        ctx.closePath();
        ctx.fill();
    
        }
    
        // --------------------------------------------------------------------------- //
        // cycle
        function cycle(num1: any, num2: any) {
            return ( num1 % num2 + num2 ) % num2;
        }
    
        // --------------------------------------------------------------------------- //
        // random
        function random (num1: any, num2: any) {
            var max = Math.max(num1, num2);
            var min = Math.min(num1, num2);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    
        // --------------------------------------------------------------------------- //
        // rotate
    
        // function rotate (x, y, angle) {
        //     var radians = (pi / 180) * angle,
        //         cos = Math.cos(radians),
        //         sin = Math.sin(radians),
        //         nx = (cos * (x - center.x)) + (sin * (y - center.y)) + center.x,
        //         ny = (cos * (y - center.y)) - (sin * (x - center.x)) + center.y;
        //     return { x: nx, y: ny };
        // }
    }, [props.isAnimating]);

    return (
        <button className=" bgtransparent relative w-full h-64 flex justify-center items-center">
            <canvas id="canvas" style={{ pointerEvents: 'none', transition: 'opacity 2s linear', opacity: props.isAnimating ? 1 : 0.05 }}></canvas>
            <div
                onClick={props.onClick}
                className="absolute text-blue-500 inset-0 m-auto w-32 h-32 flex items-center justify-center"
                style={{
                    letterSpacing: 1,
                    fontSize: '1.2em',
                    fontWeight: 700,
                    fontFamily: "'Futura', 'Helvetica Neue', Helvetica",
                }}
            >{props.value}</div>
        </button>
    )

}