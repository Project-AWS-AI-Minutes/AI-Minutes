export function mountUploadZone(rootElement) {
  const container = document.createElement('div');
  container.className = 'upload-zone';
  container.innerHTML = `
    <p><strong>Drag & Drop</strong> 또는 클릭해서 파일 선택</p>
    <input type="file" id="file-input" hidden />
    <button class="btn" id="select-file-btn">파일 선택</button>
    <div class="progress-wrap hidden" id="progress-wrap">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <p class="muted" id="progress-text"></p>
  `;

  const fileInput = container.querySelector('#file-input');
  const selectBtn = container.querySelector('#select-file-btn');
  const progressWrap = container.querySelector('#progress-wrap');
  const progressBar = container.querySelector('#progress-bar');
  const progressText = container.querySelector('#progress-text');

  function startMockUpload(fileName) {
    let progress = 0;
    progressWrap.classList.remove('hidden');
    progressText.textContent = `${fileName} 업로드 중... 0%`;
    progressBar.style.width = '0%';

    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        progressText.textContent = `${fileName} 업로드 완료 (mock)`;
      } else {
        progressText.textContent = `${fileName} 업로드 중... ${progress}%`;
      }
      progressBar.style.width = `${progress}%`;
    }, 220);
  }

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    startMockUpload(files[0].name);
  }

  selectBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => handleFiles(event.target.files));

  container.addEventListener('dragover', (event) => {
    event.preventDefault();
    container.classList.add('dragover');
  });

  container.addEventListener('dragleave', () => {
    container.classList.remove('dragover');
  });

  container.addEventListener('drop', (event) => {
    event.preventDefault();
    container.classList.remove('dragover');
    handleFiles(event.dataTransfer.files);
  });

  rootElement.appendChild(container);
}
