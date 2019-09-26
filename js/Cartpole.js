(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Cartpole = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cartpole = exports.Cartpole = function () {
    function Cartpole(svgContainer, options) {
        _classCallCheck(this, Cartpole);

        if (options === undefined) options = new Object();
        this.options = {
            massC: options.massC || 1,
            massP: options.massP || 1,
            poleL: options.poleL || 1,
            forceMult: options.forceMult || 1,
            dt: options.dt || 0.1,
            cartWidth: options.cartWidth || 60,
            cartHeight: options.cartHeight || 30,
            poleWidth: options.poleWidth || 10,
            poleHeight: options.poleHeight || 120,
            g: options.g || 10
        };
        this.options.massSum = this.options.massC + this.options.massP;
        this.initDrawing(svgContainer);
    }

    _createClass(Cartpole, [{
        key: "initDrawing",
        value: function initDrawing(svgContainer) {
            var _this = this;

            var _options = this.options,
                cartWidth = _options.cartWidth,
                cartHeight = _options.cartHeight,
                poleWidth = _options.poleWidth,
                poleHeight = _options.poleHeight;

            this.width = svgContainer.node().getBoundingClientRect().width;
            this.height = svgContainer.node().getBoundingClientRect().height;
            this.svgContainer = svgContainer;
            this.xScale = d3.scaleLinear().domain([-5, 5]).range([0, this.width]);

            this.yScale = d3.scaleLinear().domain([0, 5]).range([this.height, 0]);

            this.svgContainer = d3.select("#cartpole-drawing").attr("height", this.height).attr("width", this.width).style("background", "#DDDDDD");

            this.line = this.svgContainer.append("line").style("stroke", "black").attr("x1", this.xScale(-5)).attr("y1", this.yScale(1)).attr("x2", this.xScale(5)).attr("y2", this.yScale(1));

            this.cart = this.svgContainer.append("rect").data([0]).attr("width", cartWidth).attr("height", cartHeight).attr("x", function (d) {
                return _this.xScale(d) - cartWidth / 2;
            }).attr("y", this.yScale(1) - cartHeight / 2).attr("rx", 5).style("fill", "BurlyWood");

            this.poleG = this.svgContainer.append("g").data([180]).attr("transform", function (d) {
                return "translate(" + _this.xScale(d) + "," + _this.yScale(1) + ")";
            });

            this.pole = this.poleG.append("rect").data([180]).attr("x", -poleWidth / 2).attr("width", poleWidth).attr("height", poleHeight).attr("transform", function (r) {
                return "rotate(" + r + ")";
            });
        }
    }, {
        key: "step",
        value: function step() {
            var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            if (this.done) {
                this.reset();
            }
            if (!(action != 0 || action != 1)) {
                console.error("action", action, "is no valid action, choose 0 for left and 1 for right.");
                return;
            }
            var _options2 = this.options,
                massC = _options2.massC,
                massP = _options2.massP,
                poleL = _options2.poleL,
                forceMult = _options2.forceMult,
                massSum = _options2.massSum,
                dt = _options2.dt,
                g = _options2.g;

            var F = (action == 0 ? -1 : 1) * forceMult;

            var thetaacc_num = g * Math.sin(this.theta) + Math.cos(this.theta) * (-F - massP * poleL * this.thetadot * this.thetadot * Math.sin(this.theta)) / massSum;
            var thetaacc_den = poleL * (4 / 3 - massP * Math.pow(Math.cos(this.theta), 2) / massSum);
            var thetaacc = thetaacc_num / thetaacc_den;

            var xacc_num = F + massP * poleL * (this.thetadot * this.thetadot * Math.sin(this.theta) - thetaacc * Math.cos(this.theta));
            var xacc = xacc_num / massSum;

            this.thetadot = this.thetadot + thetaacc * dt;
            this.xdot = this.xdot + xacc * dt;

            this.x = this.x + this.xdot * dt;
            this.theta = this.theta + this.thetadot * dt;

            if (!this.done) {
                this.reward=1;
            }
            if (this.theta > Math.PI / 15 || this.theta < -Math.PI / 15) {
                this.done = true;
            }
            return {
                state: {
                    x: this.x,
                    theta: this.theta,
                    xdot: this.xdot,
                    thetadot: this.thetadot
                },
                reward: this.reward,
                done: this.done
            };
        }
    }, {
        key: "render",
        value: function render(timestep) {
            var _this2 = this;

            var _options3 = this.options,
                cartWidth = _options3.cartWidth,
                cartHeight = _options3.cartHeight,
                poleWidth = _options3.poleWidth,
                poleHeight = _options3.poleHeight;

            this.poleG.selectAll("rect").data([this.theta * 180 / Math.PI + 180]).transition().duration(timestep).attr("transform", function (r) {
                return "rotate(" + r + ")";
            });

            this.svgContainer.selectAll("g").data([this.x]).transition().duration(timestep).attr("transform", function (d) {
                return "translate(" + _this2.xScale(d) + "," + _this2.yScale(1) + ")";
            });

            this.svgContainer.selectAll("rect").data([this.x]).transition().duration(timestep).attr("x", function (d) {
                return _this2.xScale(d) - cartWidth / 2;
            });
        }
    }, {
        key: "reset",
        value: function reset() {
            this.x = 0 + Math.random() * 0.01 - 0.005;
            this.theta = 0 + Math.random() * 0.01 - 0.005;
            this.xdot = 0;
            this.thetadot = 0;
            this.done = false;
            this.reward = 0;
        }
    }]);

    return Cartpole;
}();

},{}]},{},[1])(1)
});
