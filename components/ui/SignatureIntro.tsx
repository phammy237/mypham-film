"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

/**
 * My real signature, traced from a photo of it and drawn as ONE continuous line (2000 x 896 box), in the order it is
 * written: a straight line left to right, the reverse "2" (up the left side and over the top of the loop), one line
 * straight down to the point and back up, then ham - Le - Ha - My, ending on the long flourish. It is the centerline of
 * the ink, smoothed and fitted with long flowing curves; sharp turns like the descender tip stay sharp. A stroke, not a
 * font and not a filled outline, so the pen draws it once, forward only.
 */
const SIGNATURE_LINE = `M284 481C365.1 480.2 446.1 472.3 527.1 468.1C556.1 466.5 585 468.8 614 467.6C623.8 467.2 633.6 468.5 643.2 466C635.6 458.1 625.6 457.1 615.7 453.3C598.4 446.7 580.4 440.3 563.9 431.9C557.4 428.5 552.1 423.4 546.2 419.1C518.9 399.6 512 388.2 493 361.9C476.6 339.2 459.4 315.9 454 287.8C447.5 254.2 448.5 206.6 457.2 173.4C461.3 157.9 467.1 141.4 474.6 127.2C488.7 100.3 535.3 37.5 567.1 78.2C586.4 102.8 587 142.4 587 172C587 208.6 585.2 244.3 580.6 280.7C573.2 340.1 564.3 398.8 548.8 456.7C531.8 520.1 508.7 581.6 490.9 644.7C483.8 669.5 484.9 689.3 479 710.3C482 700.2 488.8 693.8 494.1 684.9C501.3 673 507.3 660.3 513.9 648.1C537.1 605.4 563.4 564.4 587 521.8C596.1 505.5 603.5 488.3 612.2 471.7C619.1 458.5 626.3 445.1 633.8 432.2C637.7 425.6 643.3 419.9 645.9 412.6C654.6 388.9 650.4 361.5 652.1 336.8C655.5 288.1 660.1 235.2 667.3 187.1C670.3 166.5 670.5 144.9 677.7 125.2C687.9 97.3 704.1 113.4 710.6 132.9C716.2 149.7 716.6 168.5 714.7 186C709.2 237.4 694.3 291.4 676.2 339.7C672.5 349.6 669.3 360.3 663.9 369.5C659.2 377.3 652.8 382.7 650.6 392C648.5 400.4 644.7 411 644.3 419.6C644.1 424.3 647.4 429.3 647.4 434.4C647.6 445.4 645.4 456.2 645.1 467.1C644.7 486.8 646.2 507.7 643 527.2C646.4 514.4 672.1 484.5 665.4 472.8C662 466.9 649.7 467.4 643.8 466.1C656.1 468.8 668.3 467.6 680.8 468.9C690.2 469.9 699.6 471.9 709 473.1C719.4 474.3 737 481.2 746.9 477.4C753.8 474.8 756.9 463.4 759.6 457.4C762.4 451 767.4 440.6 762.8 433.9C749.1 414.3 698.6 512.1 719.9 516.1C729.1 517.9 750.1 490.2 744.9 482C741.2 476.1 728.6 476 722.5 475C712.9 473.5 694.5 475.1 687.2 468C679.2 460.3 687.9 442.7 691.3 434.4C687.8 443 684.4 452.1 682.9 461.3C681.8 468.3 683.8 475.5 683.1 482.6C682 494.9 669.2 566.5 699.7 554.4C719.5 546.5 725.4 517.7 737.1 502C744.8 491.7 754.8 497 763.2 489.5C775.5 478.4 779.4 461.1 792.7 450.9C796.1 462.7 791.6 474.3 794.6 486C804.8 479.2 808 467.4 816.8 459.2C819.4 465.7 816.5 482.5 822.6 486.2C832.2 492.2 858.9 452 862 444C855 466.9 849.4 524.1 889.8 511.1C913.3 503.6 932.5 482.1 948.8 464.6C958.6 454 971.9 441.9 979.2 429.5C985.6 418.9 981.9 406.6 981.3 395.1C980.5 380.8 980.5 366.5 979.5 352.2C977.3 317.8 976.4 267.1 980.6 233.2C981.5 226.1 984.4 215.8 993.6 217.8C1007.6 220.9 1017.2 240 1021.7 252.1C1036.4 291.9 1025.4 341.9 1007.5 379C1003.9 386.5 1000.6 394.4 996 401.3C991.9 407.7 985.9 412.5 983.7 420C976.6 443.6 990.1 488.4 984.2 512.2C982.1 520.9 975.5 526.7 970.5 533.8C965.1 541.4 960.7 549.9 956.5 558.2C935.9 598.1 919.7 646.4 925 691.9C926.4 704.3 930.3 726.5 944.7 730.5C989.9 742.8 984.3 566.2 984.7 541.1C984.8 533.2 983.1 525.1 984.2 517.3C986.4 502.7 999.9 497.3 1005.3 484.9C1010.6 473 1006.3 459 1012.7 446.8C1016.5 439.5 1041.9 423.2 1040.6 441.3C1039.4 457.8 1017.2 465.1 1011.3 479C1006.5 490.1 1022.7 493.9 1030.2 490.8C1044 485.2 1043.3 467.4 1054.3 459.6C1059.2 456 1066.1 456.7 1071.8 455.4C1078.7 453.9 1084.8 450.3 1090.1 445.8C1100.2 437.1 1112.9 423.2 1118.7 411.2C1121.1 406.3 1121.7 400.8 1123.7 395.8C1126.5 389 1130.5 383 1132.8 375.9C1142.3 346.5 1141.4 311.1 1134 281.3C1130.7 267.5 1120.5 232.7 1103.2 230.4C1091.9 229 1096 255.8 1096.5 261.9C1099.4 297.5 1108.1 341.2 1115.3 376.5C1116.6 382.8 1120.6 388.4 1121.6 394.6C1122.7 401.7 1120.7 409 1121.8 416.2C1124.9 437.7 1147.1 558.8 1114 556.9C1107.9 556.6 1104.5 550.2 1103.3 544.9C1097.6 518.3 1117.7 500.6 1128 482.1C1130.8 477.2 1131.6 471.5 1134.8 466.8C1143.1 454.8 1154.6 443.1 1164.5 432.4C1169.5 427 1176.7 422 1179.4 414.9C1184.5 402 1179.7 383.3 1180.4 369.5C1181.9 339 1185.2 307.6 1192.1 277.8C1194 269.5 1196.2 250.5 1206.7 248.6C1217.1 246.7 1224.9 261.3 1228.4 268.9C1245.4 306.1 1230.6 348.1 1208.6 379.4C1202 388.8 1183.6 402.9 1182.3 413.5C1179.4 436.2 1198.1 467.3 1219 475.7C1251.6 488.7 1262.3 462 1267.1 436.2C1268.5 429.1 1270.7 421.6 1269.9 414.2C1269.5 410.5 1267.9 405.7 1263.6 405.3C1251.3 404.2 1238.3 434.6 1243.2 444C1247.1 451.6 1257.8 447.8 1264.3 450.7C1276.4 456 1285.4 473.3 1301 465.7C1318.3 457.4 1312.3 428.6 1314.4 413.3C1317.1 393.4 1323.1 374.6 1324.5 354.3C1326.6 324.1 1324 287.2 1339.4 259.8C1359.2 224.4 1390.3 268.7 1399.6 288.6C1410.4 311.7 1414.2 335.4 1420.3 359.8C1421.3 363.8 1424.1 367.2 1425 371C1426.3 376.4 1422.4 385.2 1421.9 390.8C1420.1 411.5 1417 431.9 1415 452.5C1416.6 437.6 1419 422.7 1420.5 407.8C1421.4 398.1 1421 387.4 1424.1 378.1C1426.4 371.2 1431.8 366.1 1435.4 360C1440.6 351.3 1468.1 294.3 1482.9 312.3C1488.2 318.7 1488.7 329.4 1489.6 337.3C1492.6 361.7 1489.4 386.9 1487.6 411.3C1485.9 433.7 1482.2 456.1 1481.6 478.5C1481.3 489.3 1484.7 499.5 1484 510.3C1486.2 500.7 1492.7 494.9 1497 486.2C1504.2 471.7 1510 454.6 1521.8 443C1525.8 439 1533 435.5 1535.6 442.7C1540.7 457.1 1535 476.3 1533.7 491C1531.9 511.1 1530.1 531.4 1528.8 551.5C1528.5 556.4 1530.5 561.2 1529.9 566C1528.1 582 1519.3 597.3 1519 613.6C1521.3 599.1 1523.8 582.1 1530.4 568.9C1536 557.8 1545.1 548.1 1551.2 536.9C1598 450.1 1681.1 373.5 1771.7 333.7`;

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
