const ctc = document.getElementById('contact-btn');

ctc.addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: 'Contact Me',
        html: `
      <div style="text-align:left; font-size:16px;">
        <p style="display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="#25D366">
            <path d="M16.001 3.2c-7.064 0-12.8 5.736-12.8 12.8 0 2.256.592 4.448 1.728 6.4l-1.824 6.672 6.848-1.792c1.856.992 3.936 1.504 6.048 1.504h.001c7.064 0 12.8-5.736 12.8-12.8s-5.736-12.8-12.8-12.8zm0 23.2c-1.824 0-3.616-.48-5.2-1.392l-.368-.208-4.064 1.056 1.088-3.968-.24-.384c-1.04-1.68-1.6-3.6-1.6-5.6 0-5.92 4.8-10.72 10.72-10.72s10.72 4.8 10.72 10.72-4.8 10.72-10.72 10.72zm5.648-7.92c-.304-.16-1.808-.896-2.088-.992-.28-.096-.48-.144-.68.16-.2.304-.784.992-.96 1.2-.176.208-.352.224-.656.08-.304-.16-1.28-.472-2.432-1.504-.896-.8-1.504-1.776-1.68-2.08-.176-.304-.016-.464.128-.624.128-.128.304-.336.448-.512.144-.176.192-.304.288-.512.096-.208.048-.384-.016-.544-.16-.16-.72-1.744-.992-2.4-.256-.624-.512-.528-.72-.528-.192 0-.416-.032-.64-.032s-.592.08-.896.384c-.304.304-1.168 1.136-1.168 2.768s1.2 3.2 1.36 3.424c.16.224 2.352 3.6 5.68 5.056.792.336 1.408.544 1.888.704.792.256 1.52.224 2.096.144.64-.096 1.808-.736 2.064-1.44.256-.704.256-1.312.176-1.44-.08-.128-.272-.208-.576-.368z"/>
          </svg>
          <strong>+53 63653093</strong>
        </p>
        <p style="display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 13.065l-11.2-7.065h22.4l-11.2 7.065zm0 2.935l-12-7.5v12.5h24v-12.5l-12 7.5z"/>
          </svg>
          <a target="_blank" href="https://mail.google.com/mail/?view=cm&fs=1&to=romelio.suarez.work@gmail.com" style="color:#BB86FC;">
            romelio.suarez.work@gmail.com
          </a>
        </p>
      </div>
    `,
        confirmButtonText: 'Cerrar',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#3085d6'
    });
});


const projectInfo = document.getElementById('info-btn');

projectInfo.addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: 'About This Project',
        html: `
      <div style="
        max-height:300px;
        overflow-y:auto;
        text-align:left;
        padding-right:10px;
        font-size:15px;
        line-height:1.5;
      ">
        <h3 style="margin-top:0; color:#76a9ff;">Overview</h3>
        <p>
            This project is a technical demonstration designed to showcase a graphics module implemented in C++ and exported to WebAssembly. The goal is to provide an interactive, fast, and visually clear experience for exploring graph search algorithms. This project replaces the potential use of BFS, since BFS and Dijkstra are technically the same, with the difference that BFS always uses a weight of 1 on each edge.
        </p>

        <h3 style="color:#76a9ff;">Core Features</h3>
        <ul style="padding-left:18px;">
        <li>Dynamic rendering of nodes and connections.</li>
        <li>Dijkstra’s algorithm implemented in C++.</li>
        <li>Exported to WebAssembly using Emscripten.</li>
        <li>Minimalist and responsive interface.</li>
        <li>Integration with ES modules and modern bundling.</li>
        </ul>


        <h3 style="color:#76a9ff;">Technical Stack</h3>
        <p>
          The project uses a modern architecture based on:
        </p>
        <ul style="padding-left:18px;">
            <li>C++ for the core algorithm</li>
            <li>WebAssembly for high-performance execution</li>
            <li>Native JavaScript for the UI</li>
            <li>Vite as the development server and bundler</li>

        </ul>

        <h3 style="color:#76a9ff;">Purpose</h3>
        <p>
          This project is intended to demonstrate my skills using low-level coding environments and web environments. It also serves as a solid way to showcase my abilities with advanced algorithms such as Dijkstra’s algorithm, which is widely used in mapping applications and other services that need to compute shortest paths in weighted graphs, both directed and undirected
        </p>
      </div>
    `,
        width: 600,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6'
    });
});
