import style from './Spinner.module.css';

export default function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
      <div className={`flex justify-center items-center`}>
        <span className={style.loader}></span>
      </div>
    </div>
  );
}
