// File: js/Interpolator.js
// Dependencies : import them before Command in browser
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  // No dependencies
    var OR = OR || {};
}

// Maps time to time
// interpolate(tn) returns t for tn.
// t and tn should start at 0.0 and end at 1.0
// between 0 and 1, t can be < 0 (anticipate) and >1 (overshoot)
// Use Padé approximations to speed up complex calculations
OR.Interpolator = {
  // Linear "il"
  LinearInterpolator:function (t) {
    return t;
  },
  // Starts and ends slowly accelerate between "iad"
  /** @return {number} */
  AccelerateDecelerateInterpolator:function (t) {
    return (Math.cos((t + 1) * Math.PI) / 2.0) + 0.5;
  },
  // Model of a spring with overshoot "iso"
  /** @return {number} */
  SpringOvershootInterpolator:function (t) {
    if (t < 0.1825)
      return (((-237.110 * t) + 61.775) * t + 3.664) * t + 0.000;
    if (t < 0.425)
      return (((74.243 * t) - 72.681) * t + 21.007) * t - 0.579;
    if (t < 0.6875)
      return (((-16.378 * t) + 28.574) * t - 15.913) * t + 3.779;
    if (t < 1.0)
      return (((5.120 * t) - 12.800) * t + 10.468) * t - 1.788;
    return (((-176.823 * t) + 562.753) * t - 594.598) * t + 209.669;
  },
  // Model of a spring with bounce "isb"
  // 1.0-Math.exp(-4.0*t)*Math.cos(2*Math.PI*t)
  /** @return {number} */
  SpringBounceInterpolator:function (t) {
    var x = 0.0;
    if (t < 0.185)
      x = (((-94.565 * t) + 28.123) * t + 2.439) * t + 0.000;
    else if (t < 0.365)
      x = (((-3.215 * t) - 4.890) * t + 5.362) * t + 0.011;
    else if (t < 0.75)
      x = (((5.892 * t) - 10.432) * t + 5.498) * t + 0.257;
    else if (t < 1.0)
      x = (((1.520 * t) - 2.480) * t + 0.835) * t + 1.125;
    else x = (((-299.289 * t) + 945.190) * t - 991.734) * t + 346.834;
    return x > 1 ? 2 - x : x;
  },
  // Model of a gravity with bounce "igb"
  // a = 8.0, k=1.5; x=(a*t*t-v0*t)*Math.exp(-k*t);
  /** @return {number} */
  GravityBounceInterpolator:function (t) {
    var x = 0.0;
    if (t < 0.29)
      x = (((-14.094 * t) + 9.810) * t - 0.142) * t + 0.000;
    else if (t < 0.62)
      x = (((-16.696 * t) + 21.298) * t - 6.390) * t + 0.909;
    else if (t < 0.885)
      x = (((31.973 * t) - 74.528) * t + 56.497) * t + -12.844;
    else if (t < 1.0)
      x = (((-37.807 * t) + 114.745) * t - 114.938) * t + 39.000;
    else x = (((-7278.029 * t) + 22213.034) * t - 22589.244) * t + 7655.239;
    return x > 1 ? 2 - x : x;
  },
  // Bounce at the end "ib"
  /** @return {number} */
  BounceInterpolator:function (t) {
    function bounce(t) {
      return t * t * 8.0;
    }
    t *= 1.1226;
    if (t < 0.3535) return bounce(t);
    else if (t < 0.7408) return bounce(t - 0.54719) + 0.7;
    else if (t < 0.9644) return bounce(t - 0.8526) + 0.9;
    else return bounce(t - 1.0435) + 0.95;
  },
  // Overshoot "io"
  /** @return {number} */
  OvershootInterpolator:function (t) {
    const mTension = 2;
    t -= 1.0;
    return t * t * ((mTension + 1) * t + mTension) + 1.0;
  },
  // Anticipate "ia"
  /** @return {number} */
  AnticipateInterpolator:function (t) {
    const mTension = 0; // 2
    return t * t * ((mTension + 1) * t - mTension);
  },
  // Anticipate Overshoot "iao"
  /** @return {number} */
  AnticipateOvershootInterpolator:function (t) {
    const mTension = 1.5;
    function a(t, s) {
      return t * t * ((s + 1) * t - s);
    }
    function o(t, s) {
      return t * t * ((s + 1) * t + s);
    }
    if (t < 0.5) return 0.5 * a(t * 2.0, mTension);
    else return 0.5 * (o(t * 2.0 - 2.0, mTension) + 2.0);
  }
};

// Just for Node.js
if (NODE_ENV === true && typeof module !== 'undefined' && module.exports) {
  module.exports = OR.Interpolator;
}
