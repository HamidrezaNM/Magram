import html2canvas from "html2canvas";
import { memo, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { handleDeleteMessageEffect } from "../Stores/UI";

function DeleteEffect({ }) {
    const msg = useSelector(state => state.ui.deleteEffect)

    const canvas = useRef()

    const dispatch = useDispatch()

    useEffect(() => {
        const ctx = canvas.current.getContext('2d');
        canvas.current.width = window.innerWidth;
        canvas.current.height = window.innerHeight;

        const rect = msg.getBoundingClientRect();
        const bubbleRect = msg.querySelector('.bubble').getBoundingClientRect();

        const particles = [];

        msg.classList.add('clip')

        msg.style.minHeight = rect.height + 'px'

        html2canvas(msg, { scale: 1 }).then(snapshot => {
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            ctx.drawImage(snapshot, rect.left, rect.top);

            const imageData = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);

            const preferredParticles = 8000

            const particleCount = bubbleRect.width * bubbleRect.height

            const spacePerParticle = Math.round(Math.sqrt(particleCount / preferredParticles))

            const finalSpacePerParticle = spacePerParticle < 3 ? 3 : spacePerParticle

            for (let y = 0; y < rect.height; y += finalSpacePerParticle) {
                for (let x = 0; x < rect.width; x += finalSpacePerParticle) {
                    const i = ((y * rect.width) + x) * 4;
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];

                    if (i === 0) console.log(r, g, b, a)

                    if (a > 0 && !(r >= 253 && g >= 253 && b >= 253)) {
                        const delay = x / rect.width * 30;

                        particles.push({
                            ox: rect.left + x,
                            oy: rect.top + y,
                            x: rect.left + x,
                            y: rect.top + y,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -(Math.random() * 3 + 1),
                            alpha: 1,
                            color: `rgba(${r},${g},${b},${a / 255})`,
                            delay: delay,
                            age: 0
                        });
                    }
                }
            }

            msg.classList.add('deleteEffect')

            animate(particles);
        });

        function animate(particles) {
            function draw() {
                ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

                particles.forEach(p => {
                    if (p.age >= p.delay) {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.alpha -= 0.02;
                    } else {
                        ctx.fillStyle = p.color;
                        ctx.fillRect(p.ox, p.oy, 2, 2);
                    }

                    if (p.alpha > 0 && p.age >= p.delay) {
                        ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, `${p.alpha})`);
                        ctx.fillRect(p.x, p.y, 2, 2);
                    }

                    p.age++;
                });

                if (particles.some(p => p.alpha > 0)) {
                    requestAnimationFrame(draw);
                } else {
                    dispatch(handleDeleteMessageEffect())
                }
            }

            draw();
        }
    }, [])

    return <canvas className="DeleteEffect" ref={canvas}></canvas>
}

export default memo(DeleteEffect)