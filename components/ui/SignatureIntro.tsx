"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

/**
 * My real signature, traced from a photo of it and drawn as ONE continuous line (2000 x 896 box): the
 * centerline of the ink, walked in a single pass from the long stroke on the far left to the end of the
 * finishing flourish, then fitted with smooth curves. It is a stroke, not a font and not a filled outline,
 * so the pen draws it once, forward only. Smoothed along its length (sharp turns like the descender tip stay sharp)
 * and fitted with long flowing cubic curves.
 */
const SIGNATURE_LINE = `M284 481C385.4 480 486.4 465.4 588 467.9C603.1 468.2 618.2 467.8 633.3 467.6C641.7 467.4 657.9 464.8 664.5 471.6C674.8 482.3 651.1 508.7 646.3 517.5C644 521.9 643.5 526 643 530.9C645.6 501.9 646.5 467.3 647.4 437.9C647.6 431.7 643.8 424.9 644.4 419.3C645.4 408.9 649.6 398.8 650.7 388.3C652.4 371.9 650.9 355.1 652 338.7C653.6 313.2 657.5 287.8 659.5 262.3C661.9 232.9 665.1 203.9 669 174.7C671.3 157.7 671.9 140.5 678.1 124.2C689.3 94.8 707.9 121 712.4 139.3C718.2 162.7 715.3 186.5 710.5 209.7C701.8 252.2 692.5 294.5 677.8 335.5C673.9 346.3 670.3 357.8 664.7 367.9C661.4 374.1 655.7 378.8 652.8 385.3C648.5 394.5 649.2 405.2 645.2 414.6C641.4 423.3 619.6 458.3 613.1 470C602.6 488.9 594.5 509.2 583.6 527.9C557.7 572.6 530.6 616.6 506.3 662.1C499 675.8 482.6 698 479 710.8C483.9 691.5 483.7 671.8 488.8 652.3C502 601.6 520.6 552.2 535.9 502.2C540.1 488.3 543.8 474.1 547.8 460.2C551 449.3 550.5 430.5 565.2 432.2C560.4 430.2 558 428 557.9 422.4C557.8 409.7 567.2 376 569.8 360.8C577.5 315.1 584.2 268.2 586.6 221.9C588.4 188.2 592.3 24.9 519.7 73.2C487 94.9 469.8 133.7 458.4 169.6C456.4 175.9 453.8 205.9 451 208.3C451.8 204 452.4 199.8 453 195.5C453.7 204.9 451.1 214.7 451 224.1C450.7 260.1 451.4 293.2 468.2 325.9C475.2 339.7 485.4 351.9 494.5 364.5C502.6 375.8 509.3 387.5 519.2 397.6C528.5 407.1 544.4 413.6 551.6 424.6C557.9 434.2 542.2 460.1 550.5 465.5C555.9 468.9 566.4 467 572.4 467.3C584.3 467.7 598.5 470.2 610.1 466.8C619.2 464 622.8 456.1 633.6 459.4C639.7 461.3 644.6 465.7 651 467.1C660.3 469.2 669.6 468.2 679.1 468.7C690.1 469.4 701.7 472 712.7 473.5C721.7 474.8 742.7 482.6 750 475.3C755.5 469.8 774.2 432.7 758.2 431.3C742.8 429.9 733 457.8 727.9 468.4C722.9 478.7 708.1 501.6 715.6 513.2C724 526.1 748.4 491.9 745.4 483C743.4 477.3 733.1 476.8 728.2 475.9C716.9 474 697.8 475.5 688.4 469C679.8 463.1 685.8 445 690 437.7C681.8 459.5 685 465.3 682.8 486.3C680.8 504.2 676.5 523.4 680.8 541.2C683.1 551.1 691.2 559.1 701.5 553.5C719.6 543.9 724.9 519.2 736 503.5C745.6 490.1 754.5 497.9 763.8 488.9C775.7 477.6 779.4 460.1 793.5 451.1C795.5 462.8 790.9 475 795.5 486.1C804.9 478.4 808.2 466.7 817.7 459C819.1 465 816.7 483.7 823 486.5C830.9 489.9 859.6 450.5 863 441.5C854.5 466.3 849.5 527.4 893.2 509.9C915 501.1 932.6 481.7 948.4 465C958.4 454.3 971.3 442.3 979 430C985.5 419.4 982 407.1 981.3 395.6C980.5 381.3 980.5 367.1 979.6 352.8C977.3 319.9 976.3 264.4 980.8 232.3C981.8 225 985.1 215.4 994.3 218C1008.7 222 1018 241.5 1022.5 254.3C1036 293.4 1025.2 342.2 1007.7 378.5C1003.9 386.4 1000.5 394.8 995.6 402.1C991.6 407.9 986.1 412.5 983.8 419.5C976.3 443 990.5 489.5 984 513C981.8 521.1 975.6 526.7 970.8 533.3C965.3 540.9 961 549.4 956.7 557.7C936 597.7 919.9 645.8 924.9 691.4C926.3 703.9 930 725.9 944.2 730.3C989.2 744.3 984.4 564.8 984.7 540.2C984.7 532.4 983 524.3 984.3 516.5C986.8 502.2 1000.7 496.7 1005.6 484.2C1010.2 472.4 1006.5 459.2 1012.5 447.2C1016.1 440 1041.2 422.9 1040.7 440.9C1040.2 457.1 1017.8 465.4 1011.4 478.6C1006.2 489.5 1022.1 493.9 1029.8 491C1043.8 485.7 1043.2 468.1 1053.9 459.8C1058.8 456.1 1065.6 456.7 1071.3 455.5C1078.7 454 1085.1 450.1 1090.7 445.2C1100.6 436.5 1113.7 422.6 1119.1 410.4C1121.3 405.5 1121.9 400 1124 395C1126.7 388.7 1130.5 383 1132.7 376.5C1142.2 347.5 1141.3 312.6 1134.5 283.2C1131.2 268.7 1121.3 233.7 1103.6 230.5C1092.1 228.4 1096 253.9 1096.3 259.9C1098.4 291.6 1108.7 345.4 1115.5 377.3C1116.8 383.3 1120.5 388.5 1121.6 394.3C1122.9 401.2 1120.7 408.6 1121.7 415.7C1125.9 445.7 1131.5 474.8 1132.7 505.1C1133.2 517.2 1133.6 557 1114.5 556.9C1109.9 556.9 1106.5 553.2 1104.7 549.3C1094.3 525.7 1115.4 501.5 1127.1 483.6C1130.4 478.5 1131.2 472.3 1134.5 467.2C1142.8 454.8 1154.9 442.6 1165.1 431.7C1169.9 426.6 1176.5 422 1179.3 415.4C1184.6 402.7 1179.7 383.7 1180.3 370.1C1181.8 340 1185.1 309.2 1191.6 279.7C1193.6 271.1 1195.7 251.2 1206.3 248.7C1213.6 247 1219.9 254.6 1223.4 259.9C1239.1 283.4 1238.2 317.9 1228.7 343.5C1222.8 359.5 1212.8 375 1202 388.1C1195.5 396 1183.2 403.4 1182.2 414.3C1180.2 436.8 1197.8 466.9 1218.5 475.5C1230 480.2 1244.7 479.9 1254 470.7C1261.4 463.4 1280.9 408 1263.9 405.3C1251.5 403.4 1238.7 434.3 1243 443.6C1246.6 451.5 1257.3 447.8 1263.9 450.5C1276.3 455.7 1285.8 474 1301.7 465.4C1318.1 456.5 1312.3 429 1314.3 413.8C1317 393.4 1323.2 374.2 1324.6 353.4C1326.6 323.3 1323.4 282.9 1341.3 256.7C1362 226.4 1390.8 269.9 1399.4 288.1C1409.8 310.1 1414.8 333 1419.6 356.7C1420.6 361.7 1424.4 366.6 1425 371.4C1425.8 377 1422.5 384.6 1422 390.3C1420 412.1 1416.2 433.8 1415 455.6C1415.9 440.7 1418.5 426 1420.1 411.2C1421.3 400.6 1420.7 388.8 1424 378.5C1426.3 371.3 1432 365.8 1435.9 359.3C1440.9 350.7 1469.2 293.3 1483.4 312.8C1488.3 319.6 1488.8 330.1 1489.7 338.2C1492.5 362.1 1489.4 386.9 1487.6 410.8C1485.9 433.6 1482.1 456.5 1481.6 479.4C1481.4 490.1 1484.6 500.2 1484 510.9C1486 501.1 1492.3 495.4 1496.7 486.7C1504.1 472.1 1509.8 455.3 1521.5 443.3C1525.2 439.5 1532.6 435.2 1535.4 442.3C1541.5 457.5 1534.4 479.1 1533.4 494.8C1532.2 513.6 1530.2 532.3 1528.8 551C1528.5 556.3 1530.6 561.4 1529.9 566.6C1527.4 583.2 1521.8 600.3 1517.7 616.6C1521.4 601.8 1523.5 586.1 1529.1 571.9C1533.6 560.5 1543.6 550.8 1549.6 539.9C1597.2 452.3 1679.6 373.7 1771.7 333.7`;

/** pen line, in the 2000 x 896 box (about 3px at full size) */
const LINE_WIDTH = 4.5;

const DRAW_DURATION = 6;
const HOLD = 0.5;
const SIG_FADE = 1.1;
const BG_FADE = 1.4;
const TOTAL_MS = (DRAW_DURATION + HOLD + SIG_FADE) * 1000;

export default function SignatureIntro() {
  const [visible, setVisible] = useState(false);
  const lineRef = useRef<SVGPathElement>(null);
  const nibRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!visible) return;
    const line = lineRef.current, nib = nibRef.current;
    if (!line || !nib) return;
    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length} ${length}`;
    const draw = (progress: number) => {
      line.style.strokeDashoffset = String(length * (1 - progress));
      const { x, y } = line.getPointAtLength(length * progress);
      nib.setAttribute("transform", `translate(${x} ${y})`);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1);
      nib.style.opacity = "0";
      return;
    }
    draw(0);
    // near-constant pen speed, easing only at the very start and end, like a real signature
    const controls = animate(0, 1, {
      duration: DRAW_DURATION,
      ease: [0.3, 0.05, 0.7, 0.95],
      onUpdate: draw,
      onComplete: () => { nib.style.transition = "opacity 0.4s"; nib.style.opacity = "0"; },
    });
    return () => controls.stop();
  }, [visible]);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen")) return;
    sessionStorage.setItem("intro-seen", "1");
    setVisible(true);
    const t = setTimeout(dismiss, TOTAL_MS);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer bg-film-cream text-film-black dark:bg-film-black dark:text-film-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: BG_FADE, ease: [0.65, 0, 0.35, 1] }}
          onClick={dismiss}
        >
          <motion.svg
            viewBox="0 0 2000 896"
            className="relative w-[min(1200px,96vw)] h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            animate={{
              opacity: [1, 1, 0],
              scale: [1, 1, 1.05],
              filter: ["blur(0px)", "blur(0px)", "blur(6px)"],
            }}
            transition={{
              duration: DRAW_DURATION + HOLD + SIG_FADE,
              times: [0, (DRAW_DURATION + HOLD) / (DRAW_DURATION + HOLD + SIG_FADE), 1],
              ease: "easeInOut",
            }}
          >
            {/* The signature: a single line, revealed along its own length */}
            <path
              ref={lineRef}
              d={SIGNATURE_LINE}
              stroke="currentColor"
              strokeWidth={LINE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ strokeDasharray: "0 1e5" }}
            />

            {/* Pen tip: rides the end of the line (positioned by the effect above) */}
            <g ref={nibRef} transform="translate(-100 -100)">
              <circle r="12" fill="#F4D35E" fillOpacity={0.45} />
              <circle r="5.5" fill="#F4D35E" stroke="currentColor" strokeWidth={1.5} />
            </g>
          </motion.svg>

          <motion.button
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="absolute bottom-10 font-mono text-xs opacity-50 hover:opacity-80 transition-opacity tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
