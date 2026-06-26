// จุดเริ่มต้นของแอป — เอา component <App /> ไปแสดงใน <div id="root"> ของ index.html
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
