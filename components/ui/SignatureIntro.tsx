"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

/**
 * My real signature, traced from a photo of it and drawn as ONE continuous line (2000 x 896 box), in the order it is
 * written: a straight line left to right, the reverse "2" (up the left side and over the top of the loop), one line
 * straight down to the point and back up, then ham - Le - Ha - My, ending on the long flourish. It is the centerline of
 * the ink, smoothed and fitted with long flowing curves; the points are rounded off and any second pass over the same ink is snapped onto the first, so it reads as one clean, round line. A stroke, not a
 * font and not a filled outline, so the pen draws it once, forward only.
 */
const SIGNATURE_LINE = `M284 481C367.1 479.5 449.7 470.7 532.8 467.8C560.8 466.9 588.7 468.7 616.6 467.4C621.4 467.2 636.9 470.4 639.7 465.3C641.1 462.6 636.6 460.3 634.8 459.5C629.5 457.2 623.7 456.3 618.2 454.3C600 447.7 581.4 440.3 563.8 432C557.6 429 553 423.8 547.4 419.9C513.9 396.5 484.4 357.1 466.4 320.3C453.6 294.3 451.4 267.3 451.2 238.8C450.9 188.4 462.2 136.5 495.5 97.2C507.8 82.6 526 64.4 547 68.3C585.2 75.2 586.8 147 587 176.5C587.3 251.4 577.6 327.5 562.3 400.8C555 435.9 545.8 471.4 534.9 505.5C523.7 540.2 512.4 574.9 501.7 609.8C494.2 634.3 485.8 658.8 483.1 684.4C482.9 686.2 480.4 699 482.3 700C485 701.5 580.1 534.8 588.4 519.4C596.8 503.7 603.7 487 612.2 471.4C619.6 458 626.7 444.1 634.4 430.9C638 424.7 644.1 419.8 646.2 412.8C651.6 393.9 650.8 373.9 651.4 354.5C652.1 336 654.2 317.7 656 299.4C659.8 260.5 662.5 221.5 667.8 182.8C669.6 169.7 670.9 112.2 692.8 114.7C703.7 115.9 709.1 131.3 711.5 140.2C719.1 168.8 712.8 198.6 707.1 226.9C699.2 266.3 688.9 305.6 674.7 343.2C669 358.4 660.8 372 653.6 386.4C648.6 396.4 646.8 408.7 643.8 419.4C643.2 421.6 646.3 424.2 646.9 426.3C647.8 429.8 647.7 433.6 647.5 437.2C646.3 463.4 644 488.6 644.6 515C644.7 518.5 642.5 528.9 643.3 525.5C647.4 509.1 691.9 464.8 646.5 466.7C643.6 466.9 652.3 467.7 655.2 468C663.8 468.9 672.4 467.7 680.8 468.6C691.5 469.7 702.6 472 713.3 473.6C723 475 736.6 480.2 746.2 478.4C754.1 476.9 769.3 439.6 762.7 432.5C746.7 415.1 701.1 510.7 718.6 516.6C728.3 519.9 749.5 487.3 745.4 481.4C741.9 476.5 731.6 476.5 726.2 475.6C717.7 474.2 690.6 473.5 685.7 467.8C679.8 460.9 686.7 446.4 689.2 439.2C689.9 437.2 687.9 443 687.3 445C681.7 462.5 684.1 473.4 682.2 491.1C680.6 505.5 672.3 536 685.1 547.5C709.3 569.5 729.6 508.5 741.3 496.5C748.2 489.3 757.8 496.6 765.2 487.9C771.4 480.6 778.7 459.8 788.3 457.7C793.3 456.6 793.9 472.9 797.3 475.6C802.5 479.8 808.6 468 814.2 469.1C820.5 470.4 819.6 482.1 827.4 481.6C836.7 481 854.4 451 858.8 452.5C860.4 453.1 858.2 465.8 858.1 467.3C856.9 487.9 862.5 515.6 889.6 509.1C913.1 503.4 932.8 481.5 948.6 464.4C962.6 449.3 980.1 433.1 981.6 411.3C983 390.9 980.4 369.7 979.6 349.2C978.8 328.3 979 307.4 979 286.5C979.1 269 976.7 247.7 983.2 231.1C986 224 991.9 220.3 999.1 223.8C1013.1 230.6 1020.6 249.1 1024.2 263.2C1033.7 300.6 1023.3 343.3 1007.7 377.6C1000.9 392.5 989.7 406.3 985.2 422.1C977.1 451 990 482.6 982.1 511.5C977.1 530 962.7 546.2 954.2 563.3C935 601.8 920.3 648.2 925.9 691.7C927.4 703.8 931.9 724 946.6 726.5C990.8 733.9 980.6 553.6 985.2 521.4C987.3 506.8 997.5 497.1 1003.1 484.1C1007.6 473.6 1007.9 461.9 1012.9 451.7C1016 445.2 1037.2 426.7 1036 444C1035.1 457.5 1019.6 465.2 1015.8 477.5C1012.6 487.7 1024.4 489.9 1031.5 486.3C1041.9 480.9 1046.7 468.9 1056 462.1C1064.4 456.1 1074.9 453.9 1083.7 448.5C1097 440.3 1108 427 1115.7 413.6C1141.6 369.1 1147.5 309.2 1126.7 261.5C1123.2 253.5 1115.4 235.7 1104.6 235.6C1093.5 235.5 1096.9 259.9 1097.5 266.1C1101.7 309 1112.1 351 1120 393.2C1124.9 420.1 1130.9 471.5 1132 498.5C1132.5 509.6 1134 553.2 1114.5 551.7C1110 551.4 1107.2 547 1106 543C1098.3 518 1122.3 487.7 1135.3 468.3C1147.7 449.6 1169.8 434 1177.4 412.6C1182.6 397.9 1180.1 380.5 1180.8 365.2C1182 340.7 1185.1 316 1189.5 291.9C1191.4 281.7 1194.6 253.2 1209.5 253.4C1217 253.5 1222.7 261.4 1225.9 267.3C1238.7 290.6 1236.2 322.3 1226.7 346.3C1221.4 359.8 1213.5 372.2 1204.7 383.7C1198.4 391.9 1190.1 399.8 1186.4 409.7C1177.2 434.4 1200.1 470.1 1224.9 475.3C1255 481.5 1267.6 448.9 1268 424.5C1268.1 420 1267.6 409.9 1260.9 410.5C1249.4 411.6 1241.8 433.3 1247.4 442.1C1251.3 448.3 1260 450.5 1266.2 453.5C1278.6 459.7 1296.1 471.5 1306.6 455.7C1314.9 443.2 1313.3 424.9 1315.4 410.6C1319.4 384.3 1324.1 359 1325.8 332.4C1327.1 310.4 1326.7 258.8 1353.9 251C1369.3 246.6 1382.6 261.8 1390.2 273.1C1404.2 294 1411.4 318.8 1417 343.2C1419.3 353.3 1423.1 363.9 1423.4 374.3C1424 396.9 1418.9 420.6 1416.1 442.9C1415.7 445.7 1416.8 437.4 1417.1 434.6C1419.3 417.3 1419.8 398.8 1424.7 382C1430.1 363.8 1442.5 344.5 1454.1 329.5C1458.9 323.3 1468.5 311.1 1477.9 314.6C1493.2 320.2 1490.5 354.1 1490.1 366.5C1489.5 391.3 1487.6 416.1 1485.1 440.7C1483.4 458.4 1479.4 478.5 1483.8 496.1C1484.5 498.9 1485.9 500.7 1488.3 498.2C1494.5 492 1520.1 432.3 1532.2 445.6C1541.8 456.2 1534.5 484.2 1533.5 496.9C1531 529.9 1530.5 563 1522.7 595.2C1522 598.2 1519.9 607.3 1520.6 604.3C1527.1 575.5 1541.4 553.5 1556 528.3C1605.7 442.9 1682.9 376.3 1771.7 333.7`;

/** pen line, in the 2000 x 896 box (about 3px at full size) */
const LINE_WIDTH = 4.5;

const DRAW_DURATION = 3.2;
const HOLD = 0.35;
const SIG_FADE = 0.8;
const BG_FADE = 1.0;
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

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismiss = useCallback(() => { if (timer.current) clearTimeout(timer.current); setVisible(false); }, []);
  const show = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(true);
    timer.current = setTimeout(dismiss, TOTAL_MS);
  }, [dismiss]);

  useEffect(() => {
    // plays once per tab, and again whenever the visitor clicks the logo ("replay-intro")
    const replay = sessionStorage.getItem("replay-intro");
    if (replay) sessionStorage.removeItem("replay-intro");
    if (replay || !sessionStorage.getItem("intro-seen")) {
      sessionStorage.setItem("intro-seen", "1");
      show();
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    const onReplay = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("replay-intro", onReplay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("replay-intro", onReplay);
    };
  }, [show, dismiss]);

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
