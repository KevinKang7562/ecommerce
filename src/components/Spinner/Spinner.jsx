import style from './Spinner.module.css';

export default function Spinner() {
  // return (
  //   <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
  //     <div className={`flex justify-center items-center`}>
  //       <span className={style.loader}></span>
  //     </div>
  //   </div>
  // );
  return (
    // 💡 w-full(너비 100%), h-full(높이 100%), min-h-[200px](영역이 좁을 때를 대비한 최소 높이 200px 보장)
    <div className="flex justify-center items-center w-full h-full min-h-[200px]">
      <span className={style.loader}></span>
    </div>
  );
}
