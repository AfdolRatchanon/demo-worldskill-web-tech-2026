// จุดเริ่มต้นของแอป — เอา component <App /> ไปแสดงใน <div id="root"> ของ index.html
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // โหลด CSS (มี @media สำหรับจอเล็ก = responsive)

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
