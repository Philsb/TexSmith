const Interpolation = {
    SmoothStep: (a,b,alpha) => {
        //SmoothStep Interpolation
        return (b - a) * ((alpha * (alpha * 6.0 - 15.0) + 10.0) * alpha * alpha * alpha) + a;
    },
    Lerp: (a,b,alpha) => {
        return a + (b - a) * alpha;
    },
    Circle: (a,b,alpha) => {
        return a + (1 - Math.sqrt(1 - alpha**2))*(b - a);
    },
    CircleInverted: (a,b,alpha) => {
        return a + (Math.sqrt(1 - (alpha-1)**2))*(b - a);
    }

};

export {Interpolation};


