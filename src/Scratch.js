export default class Scratch {
  constructor(canvas, imageSrc, width, height) {
    this.isDrawing = false;
    this.canvas = document.querySelector('.ScratchCard__Canvas');
    this.width = width;
    this.height = height;
    this.lastPoint = null;
    this.ctx = this.canvas.getContext('2d');
    this.appURL = 'https://scratch-card-app.herokuapp.com';
    this.scReportSent = sessionStorage.getItem('scReportSent') === 'true';
    this.scratchCardContainer = document.querySelector('.sc-code-container');
    this.scratchedOnce = sessionStorage.getItem('scratchedOnce') === 'true';
  }

  async sendReport() {
    const { scReportSent } = this;
    if (scReportSent) return;
    const shop = Shopify?.shop ? Shopify?.shop : window.location.hostname;
    const sendReport = await fetch(
      `${this.appURL}/analytics/report?shop=${shop}`
    );
    const response = await sendReport.json();
    const isSuccess = response.message === 'success';
    if (isSuccess) this.scReportSent = true;
  }

  getFilledInPixels(stride) {
    if (!stride || stride < 1) {
      stride = 1;
    }

    const x = 0;
    const y = 0;
    const { width } = this.canvas;
    const { height } = this.canvas;

    const pixels = this.ctx.getImageData(x, y, width, height);

    const total = pixels.data.length / stride;
    let count = 0;

    for (let i = 0; i < pixels.data.length; i += stride) {
      if (parseInt(pixels.data[i], 10) === 0) {
        count++;
      }
    }

    return Math.round((count / total) * 100);
  }

  getScratchCardState() {
    if (this.scratchedOnce) {
      this.canvas.style.transition = '1s';
      this.canvas.style.opacity = '0';
      this.canvas.style.zIndex = '0';
    }
  }

  getMouse(e, canvas) {
    const { top, left } = canvas.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    let x = 0;
    let y = 0;

    if (e && e.pageX && e.pageY) {
      x = e.pageX - left - scrollLeft;
      y = e.pageY - top - scrollTop;
    } else if (e && e.touches) {
      x = e.touches[0].clientX - left - scrollLeft;
      y = e.touches[0].clientY - top - scrollTop;
    }

    return { x, y };
  }

  distanceBetween(point1, point2) {
    if (point1 && point2) {
      return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
    }

    return 0;
  }

  angleBetween(point1, point2) {
    if (point1 && point2) {
      return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }
    return 0;
  }

  handlePercentage(filledInPixels = 0) {
    if (this.isFinished) {
      return;
    }
    const finishPercent = 70;

    if (filledInPixels > finishPercent) {
      this.canvas.style.transition = '1s';
      this.canvas.style.zIndex = '0';
      this.canvas.style.opacity = '0';
      this.isFinished = true;
      let reportSent = sessionStorage.getItem('scReportSent');
      if (reportSent !== 'true') {
        sessionStorage.setItem('scReportSent', true);
        this.sendReport();
      } else {
      }
      sessionStorage.setItem('scratchedOnce', true);
    }
  }

  handleMouseDown = (e) => {
    this.isDrawing = true;
    this.lastPoint = this.getMouse(e, this.canvas);
  };

  handleTouchMove = (e) => {
    const codeContainer = document.querySelector('.sc-code-container');
    if (codeContainer) codeContainer.style.opacity = 1;
    const currentPoint = this.getMouse(e, this.canvas);
    const distance = this.distanceBetween(this.lastPoint, currentPoint);
    const angle = this.angleBetween(this.lastPoint, currentPoint);

    let x;
    let y;

    for (let i = 0; i < distance; i++) {
      x = this.lastPoint ? this.lastPoint.x + Math.sin(angle) * i : 0;
      y = this.lastPoint ? this.lastPoint.y + Math.cos(angle) * i : 0;
      this.ctx.globalCompositeOperation = 'destination-out';

      if (this.brushImage && this.props.customBrush) {
        this.ctx.drawImage(
          this.brushImage,
          x,
          y,
          this.props.customBrush.width,
          this.props.customBrush.height
        );
      } else {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, 2 * Math.PI, false);
        this.ctx.fill();
      }
    }

    this.lastPoint = currentPoint;
    this.handlePercentage(this.getFilledInPixels(32));
  };

  handleMouseMove = (e) => {
    if (!this.isDrawing) {
      return;
    }
    const currentPoint = this.getMouse(e, this.canvas);
    const distance = this.distanceBetween(this.lastPoint, currentPoint);
    const angle = this.angleBetween(this.lastPoint, currentPoint);

    let x;
    let y;

    for (let i = 0; i < distance; i++) {
      x = this.lastPoint ? this.lastPoint.x + Math.sin(angle) * i : 0;
      y = this.lastPoint ? this.lastPoint.y + Math.cos(angle) * i : 0;
      this.ctx.globalCompositeOperation = 'destination-out';

      if (this.brushImage && this.props.customBrush) {
        this.ctx.drawImage(
          this.brushImage,
          x,
          y,
          this.props.customBrush.width,
          this.props.customBrush.height
        );
      } else {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, 2 * Math.PI, false);
        this.ctx.fill();
      }
    }

    this.lastPoint = currentPoint;
    this.handlePercentage(this.getFilledInPixels(32));
  };

  handleMouseUp = () => {
    this.isDrawing = false;
  };

  render() {
    this.canvas.addEventListener('touchstart', this.handleTouchMove);
    this.canvas.addEventListener('mousemove', function () {
      const codeContainer = document.querySelector('.sc-code-container');
      if (codeContainer) codeContainer.style.opacity = 1;
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleMouseUp);
  }
}
