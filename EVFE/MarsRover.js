var Drawing;
(function (Drawing) {
    var Point = (function () {
        function Point(x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.X = x;
            this.Y = y;
        }
        Point.prototype.Times = function (multiplier) {
            return new Point(this.X * multiplier, this.Y * multiplier);
        };
        return Point;
    })();
    Drawing.Point = Point;
})(Drawing || (Drawing = {}));
var Drawing;
(function (Drawing) {
    var DrawingCanvas = (function () {
        function DrawingCanvas(canvas) {
            this.canvas = canvas;
            this._canvas = canvas;
            this._ctx = canvas.getContext('2d');
        }
        DrawingCanvas.prototype.SetStrokeColor = function (strokeColor) {
            var color = this.FormatColor(strokeColor);
            this._ctx.strokeStyle = color;
        };

        DrawingCanvas.prototype.SetFillColor = function (fillColor) {
            var color = this.FormatColor(fillColor);
            this._ctx.fillStyle = color;
        };

        DrawingCanvas.prototype.FormatColor = function (color) {
            var colorString = color.replace("#", "");
            var alpha = "255";
            if (colorString[0].match(/[0-9A-Fa-f]/)) {
                if (colorString.length == 8) {
                    alpha = (parseInt(colorString.substr(0, 2), 16) / 255).toString();
                    var r = this.HexToDecimal(colorString.substr(2, 2));
                    var g = this.HexToDecimal(colorString.substr(4, 2));
                    var b = this.HexToDecimal(colorString.substr(6, 2));
                    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
                } else {
                    return "#" + colorString;
                }
            }
            return color;
        };

        DrawingCanvas.prototype.HexToDecimal = function (hex) {
            return parseInt(hex, 16).toString();
        };

        DrawingCanvas.prototype.DrawRect = function (x, y, w, h) {
            this._ctx.fillRect(x, y, w, h);
        };

        /** Draws a circle at center (x, y) with radius r */
        DrawingCanvas.prototype.DrawCircle = function (x, y, r) {
            this._ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            this._ctx.fill();
        };

        /** Must be called with at least 3 points */
        DrawingCanvas.prototype.DrawPolygon = function (points) {
            if (!points || points.length < 3)
                throw new Error("Argument Exception in DrawPolygon");
            var context = this._ctx;
            context.beginPath();
            var p = points[0];
            context.moveTo(p.X, p.Y);
            for (var key in points) {
                var pt = points[key];
                context.lineTo(pt.X, pt.Y);
            }
            context.closePath();
            context.fill();
        };

        DrawingCanvas.prototype.DrawImage = function (src, x, y) {
            var img = new Image();
            var context = this._ctx;
            img.onload = function () {
                context.drawImage(img, x, y);
            };
            img.src = src;
        };
        return DrawingCanvas;
    })();
    Drawing.DrawingCanvas = DrawingCanvas;
})(Drawing || (Drawing = {}));
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="../typings/raphael/raphael.d.ts" />
///<reference path="Point.ts" />
///<reference path="DrawingCanvas.ts" />
var Drawing;
(function (Drawing) {
    var DrawingObject = (function () {
        function DrawingObject() {
        }
        DrawingObject.prototype.DrawToSVG = function (paper) {
        };
        return DrawingObject;
    })();
    Drawing.DrawingObject = DrawingObject;
})(Drawing || (Drawing = {}));
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="../typings/raphael/raphael.d.ts" />
///<reference path="DrawingObject.ts" />
var Drawing;
(function (Drawing) {
    var SVGArea = (function () {
        function SVGArea(parent) {
            this.parent = parent;
            this.Children = [];
            var p = $(parent);
            var t = this;
            p.resize(function (evt) {
                var p = $(t.parent);
                t.paper.setSize(p.width(), p.height());
            });
            this.paper = Raphael(parent.id, p.width(), p.height());
            $(this.paper.canvas).css("z-index", 10).css({ 'position': 'absolute' });
        }
        SVGArea.prototype.AddChild = function (ele) {
            if ($.inArray(ele, this.Children) < 0) {
                this.Children.push(ele);
                ele.DrawToSVG(this.paper);
            }
        };

        SVGArea.prototype.RemoveChild = function (ele) {
            var idx = $.inArray(ele, this.Children);
            if (idx >= 0)
                this.Children.splice(idx, 1);
        };

        SVGArea.prototype.Clear = function () {
            this.Children = [];
        };
        return SVGArea;
    })();
    Drawing.SVGArea = SVGArea;
})(Drawing || (Drawing = {}));
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="../typings/raphael/raphael.d.ts" />
///<reference path="Point.ts" />
///<reference path="DrawingCanvas.ts" />
///<reference path="DrawingObject.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Drawing;
(function (Drawing) {
    var Ellipse = (function (_super) {
        __extends(Ellipse, _super);
        function Ellipse() {
            this.Offset = new Drawing.Point();
            _super.call(this);
        }
        Ellipse.prototype.GetPosition = function () {
            return this.Center;
        };

        Ellipse.prototype.SetPosition = function (center, xRadius, yRadius) {
            this.Center = center;
            this.xRadius = xRadius;
            this.yRadius = yRadius;
            if (this.rEllipse) {
                this.rEllipse.attr({ x: this.Center.X, y: this.Center.Y, rx: xRadius, ry: yRadius });
            }
        };

        /** The Polygon is translated by offset */
        Ellipse.prototype.SetOffset = function (offset) {
            this.Offset = offset;
            var t = 't';
            this.rEllipse.attr({ transform: [t, -this.Offset.X, -this.Offset.Y] });
        };

        Ellipse.prototype.SetClass = function (className) {
            this.rEllipse.node.className.baseVal = className;
        };

        Ellipse.prototype.SetFill = function (fillColor) {
            this.fillColor = fillColor;
            if (this.rEllipse)
                this.rEllipse.attr("fill", fillColor);
        };

        Ellipse.prototype.DrawToSVG = function (paper) {
            this.rEllipse = paper.ellipse(this.Center.X, this.Center.Y, this.xRadius, this.yRadius);
            this.rEllipse.attr("fill", this.fillColor);
            this.SetOffset(this.Offset);
        };

        Ellipse.prototype.Hide = function () {
            $(this.rEllipse.node).remove();
        };
        return Ellipse;
    })(Drawing.DrawingObject);
    Drawing.Ellipse = Ellipse;
})(Drawing || (Drawing = {}));
///<reference path="../typings/raphael/raphael.d.ts" />
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="Point.ts" />
///<reference path="DrawingCanvas.ts" />
///<reference path="DrawingObject.ts" />
var Drawing;
(function (Drawing) {
    var Polygon = (function (_super) {
        __extends(Polygon, _super);
        function Polygon() {
            _super.call(this);
            this.Points = [];
            this.Offset = new Drawing.Point(0, 0);
        }
        Polygon.prototype.GetPath = function () {
            return this.Path.node;
        };

        Polygon.prototype.SetFillColor = function (fillColor) {
            this.FillColor = fillColor;
            if (this.Path)
                this.Path.attr("fill", this.FillColor);
        };

        Polygon.prototype.SetStrokeColor = function (strokeColor) {
            this.StrokeColor = strokeColor;
            if (this.Path)
                this.Path.attr("stroke", this.StrokeColor);
        };

        Polygon.prototype.SetStrokeThickness = function (thickness) {
            this.StrokeThickness = thickness;
        };

        Polygon.prototype.SetZIndex = function (z) {
            this.Z = z;
        };

        /** 0-1 */
        Polygon.prototype.SetOpacity = function (opacity) {
            this.Opacity = opacity;
        };

        /** The Polygon is translated by offset */
        Polygon.prototype.SetOffset = function (offset) {
            this.Offset = offset;
            var t = 't';
            this.Path.attr({ transform: [t, -this.Offset.X, -this.Offset.Y] });
        };

        //public DrawToCanvas(canvas: DrawingCanvas) {
        //    canvas.SetFillColor(this.FillColor);
        //    canvas.SetStrokeColor(this.StrokeColor);
        //    canvas.DrawPolygon(this.Points);
        //}
        Polygon.prototype.DrawToSVG = function (paper) {
            this.paper = paper;
            var pathString = "M";
            for (var pointIndex = 0; pointIndex < this.Points.length; pointIndex++) {
                var p = this.Points[pointIndex];
                pathString += p.X + "," + p.Y;
                pathString += "L";
            }
            pathString += this.Points[0].X + "," + this.Points[0].Y;
            pathString += "L";
            this.Path = paper.path(pathString);
            this.Path.attr("stroke", this.StrokeColor);
            this.Path.attr("fill", this.FillColor);
            this.Path.attr("fill-opacity", this.Opacity);
            var t = 't';
            this.Path.attr({ transform: [t, this.Offset.X, this.Offset.Y] });
            if (this.ToolTip)
                $(this.Path.node).attr({ "data-title": this.ToolTip });
            if (this.className)
                this.Path.node.className.baseVal = this.className;
        };

        Polygon.prototype.SetClass = function (className) {
            this.className = className;
            if (this.Path)
                this.Path.node.className.baseVal = className;
        };

        Polygon.prototype.ClearPoints = function () {
            this.Points = [];
        };

        Polygon.prototype.AddPoint = function (p) {
            if (this.Points.length == 0) {
                this.minX = p.X;
                this.maxX = p.X;
                this.minY = p.Y;
                this.maxY = p.Y;
            } else {
                this.minX = Math.min(this.minX, p.X);
                this.maxX = Math.max(this.maxX, p.X);
                this.minY = Math.min(this.minY, p.Y);
                this.maxY = Math.max(this.maxY, p.Y);
            }
            this.Points.push(p);
        };

        Polygon.prototype.HitTest = function (P) {
            if (P.X < this.minX || this.maxX < P.X)
                return false;
            if (P.Y < this.minY || this.minY < P.Y)
                return false;
            if (this.PointFallsOnSegment(this.Points[0], this.Points[1], P))
                return true;
            var onRight = this.PointIsOnRightSideOfLine(this.Points[0], this.Points[1], P);
            for (var i = 1; i < this.Points.length; i++) {
                var next = i + 1;
                if (next == this.Points.length)
                    next = 0;

                if (this.PointFallsOnSegment(this.Points[i], this.Points[next], P))
                    return true;
                if (this.PointIsOnRightSideOfLine(this.Points[i], this.Points[next], P) != onRight)
                    return false;
            }
            return true;
        };

        Polygon.prototype.PointFallsOnSegment = function (L1, L2, P) {
            var x1 = Math.min(L1.X, L2.X);
            var x2 = Math.max(L1.X, L2.X);
            var y1 = Math.min(L1.Y, L2.Y);
            var y2 = Math.max(L1.Y, L2.Y);
            return x1 <= P.X && P.X <= x2 && y1 <= P.Y && P.Y <= y2 && this.PointFallsOnLine(L1, L2, P);
        };

        Polygon.prototype.PointFallsOnLine = function (endPoint1, endPoint2, pointToCheck) {
            var a = pointToCheck.X - endPoint1.X;
            var b = pointToCheck.Y - endPoint1.Y;
            var c = endPoint2.X - endPoint1.X;
            var d = endPoint2.Y - endPoint1.Y;

            var distance = Math.abs(a * d - c * b) / Math.sqrt(c * c + d * d);

            return (distance > -1 && distance < 1);
        };

        Polygon.prototype.PointIsOnRightSideOfLine = function (A, B, P) {
            var N = new Drawing.Point(A.Y - B.Y, A.X - B.X);
            var V = new Drawing.Point(P.X - A.X, A.Y - P.Y);
            var dot = V.X * N.X + V.Y * N.Y;
            return dot > 0;
        };

        Polygon.prototype.Remove = function () {
            if (this.Path)
                $(this.GetPath()).remove();
        };
        return Polygon;
    })(Drawing.DrawingObject);
    Drawing.Polygon = Polygon;
})(Drawing || (Drawing = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="Drawing/Point.ts" />
var MarsRover;
(function (MarsRover) {
    var SiteDetails = (function () {
        function SiteDetails() {
        }
        SiteDetails.prototype.Load = function (siteName, done) {
            this.SiteName = siteName;
            this.ImageDirectory = "Sites/" + encodeURIComponent(siteName);
            var t = this;
            $.getJSON(t.ImageDirectory + "/SiteDetails.js", null, function (data, textStatus, jqXHR) {
                var site = data.SiteDetails;
                t.Introduction = site.Introduction || "";
                if (site.NavCamImage) {
                    t.NavCamImage = new SiteImageDetails(t.ImageDirectory, site.NavCamImage);
                }
                if (site.FrontHazCamImage)
                    t.FrontHazCamImage = new SiteImageDetails(t.ImageDirectory, site.FrontHazCamImage);
                if (site.RearHazCamImage)
                    t.RearHazCamImage = new SiteImageDetails(t.ImageDirectory, site.RearHazCamImage);
                t.CurrentCamera = t.NavCamImage || t.FrontHazCamImage || t.RearHazCamImage;
                done();
            });
        };
        return SiteDetails;
    })();
    MarsRover.SiteDetails = SiteDetails;

    var Footprint = (function () {
        function Footprint(data) {
            this.Description = data.Description || "";
            this.Points = [];
            this.Left = data.Points[0]._x;
            this.Right = this.Left;
            this.Top = data.Points[0]._y;
            this.Bottom = this.Top;
            for (var i = 0; i < data.Points.length; i++) {
                var x = data.Points[i]._x;
                var y = data.Points[i]._y;
                this.Points.push(new Drawing.Point(x, y));
                this.Left = Math.min(x, this.Left);
                this.Top = Math.min(y, this.Top);
                this.Right = Math.max(x, this.Right);
                this.Bottom = Math.max(y, this.Bottom);
            }
            this.Name = data.Name;
            this.Z = data.Z;
            this.CameraName = data.CameraName;
            this.Observations = [];
            for (var i = 0; i < data.Observations.length; i++) {
                var obs = data.Observations[i];
                this.Observations.push(new Observation(obs));
            }
        }
        Footprint.prototype.IsNavCam = function () {
            return this.CameraName == "NavCam";
        };
        Footprint.prototype.IsFrontHazCam = function () {
            return this.CameraName == "FrontHazCam";
        };
        Footprint.prototype.IsRearHazCam = function () {
            return this.CameraName == "RearHazCam";
        };

        Footprint.prototype.IsOnScreen = function (x, y, width, height) {
            if (x + width < this.Left)
                return false;
            if (this.Right < x)
                return false;
            if (y < this.Top)
                return false;
            if (this.Bottom < y + height)
                return false;
            return true;
        };
        return Footprint;
    })();
    MarsRover.Footprint = Footprint;

    var Observation = (function () {
        function Observation(data) {
            this.Name = data.Name;
            this.Description = data.Description;
            this.SolMultiplier = data.SolMultiplier;
            this.InstrumentName = data.InstrumentName;
            this.ImageNames = data.ImageNames;
            this.Introduction = data.Introduction || "";
            this.AppearanceConditions = data.AppearanceConditions;
        }
        Observation.prototype.IsMiniTES = function () {
            return this.InstrumentName == "MiniTES";
        };
        Observation.prototype.IsPanCam = function () {
            return this.InstrumentName == "PanCam";
        };
        Observation.prototype.IsMB = function () {
            return this.InstrumentName == "MB";
        };
        Observation.prototype.IsAPXS = function () {
            return this.InstrumentName == "AXPS";
        };
        Observation.prototype.IsMI = function () {
            return this.InstrumentName == "MI";
        };
        Observation.prototype.IsRAT = function () {
            return this.InstrumentName == "RAT";
        };
        return Observation;
    })();
    MarsRover.Observation = Observation;

    var SiteImageDetails = (function () {
        function SiteImageDetails(siteDirectory, data) {
            this.Footprints = [];
            for (var i = 0; i < data.Footprints.length; i++) {
                var fp = data.Footprints[i];
                this.Footprints.push(new Footprint(fp));
            }
            this.ImageWidth = data.ImageWidth;
            this.ImageHeight = data.ImageHeight;
            this.ImageBaseName = data.ImageBaseName;
            this.ImageExtension = data.ImageExtension;
            this.XStep = data.XStep;
            this.YStep = data.YStep;
            this.CameraDisplayName = data.CameraDisplayName;
            this.SitePath = siteDirectory + "/";
        }
        SiteImageDetails.prototype.GetThumbPath = function () {
            return this.SitePath + this.ImageBaseName + "_thumb" + this.ImageExtension;
        };

        SiteImageDetails.prototype.GetFullImagePath = function () {
            return this.SitePath + this.ImageBaseName + this.ImageExtension;
        };
        return SiteImageDetails;
    })();
    MarsRover.SiteImageDetails = SiteImageDetails;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/raphael/raphael.d.ts" />
///<reference path="Drawing/DrawingObject.ts" />
///<reference path="Drawing/Ellipse.ts" />
///<reference path="Drawing/Polygon.ts" />
///<reference path="SiteDetails.ts" />
var MarsRover;
(function (MarsRover) {
    var FootprintControl = (function (_super) {
        __extends(FootprintControl, _super);
        function FootprintControl(footprint, zoomFactor) {
            this.Points = [];
            for (var i = 0; i < footprint.Points.length; i++) {
                var pt = footprint.Points[i];
                this.Points.push(new Drawing.Point(pt.X * zoomFactor, pt.Y * zoomFactor));
            }
            this.footprint = footprint;
            _super.call(this);
        }
        FootprintControl.prototype.GetFootprint = function () {
            return this.footprint;
        };

        FootprintControl.prototype.SetSelected = function (selected) {
            this.isSelected = selected;
            this.UpdateClass();
        };

        FootprintControl.prototype.UpdateClass = function () {
            var className = this.isSelected ? "selectedFootprint" : "footprint";
            if (!this.polygon)
                return;
            this.polygon.SetClass(className);
            for (var i = 0; i < this.Ellipses.length; i++) {
                var elli = this.Ellipses[i];
                elli.SetClass(className);
            }
        };

        FootprintControl.prototype.GetPath = function () {
            return this.polygon.GetPath();
        };

        /** The Footprint is translated by offset */ FootprintControl.prototype.SetOffset = function (offset) {
            this.Offset = offset;
            for (var idx in this.Ellipses) {
                var e = this.Ellipses[idx];
                e.SetOffset(offset);
            }
            this.polygon.SetOffset(offset);
        };

        FootprintControl.prototype.DrawToSVG = function (paper) {
            this.paper = paper;
            this.isHidden = false;

            //var color = this.GetColor();
            this.Ellipses = [];
            this.polygon = new Drawing.Polygon();
            for (var idx in this.Points) {
                var p = this.Points[idx];
                var ellipse = new Drawing.Ellipse();
                ellipse.SetPosition(p, 3, 3);

                //ellipse.SetFill(color);
                this.Ellipses.push(ellipse);
                ellipse.DrawToSVG(paper);
                this.polygon.AddPoint(p);
                this.Ellipses.push(ellipse);
            }

            //this.polygon.SetFillColor(color);
            //this.polygon.SetStrokeColor(color);
            this.polygon.SetOpacity(.2);
            if (this.ToolTip)
                this.polygon.ToolTip = this.ToolTip;
            this.polygon.DrawToSVG(paper);

            this.UpdateClass();
        };

        FootprintControl.prototype.Show = function () {
            if (this.isHidden)
                this.DrawToSVG(this.paper);
        };

        FootprintControl.prototype.Hide = function () {
            this.isHidden = true;
            if (this.polygon)
                this.polygon.Remove();
            for (var i = 0; i < this.Ellipses.length; i++) {
                var elli = this.Ellipses[i];
                elli.Hide();
            }
        };
        return FootprintControl;
    })(Drawing.DrawingObject);
    MarsRover.FootprintControl = FootprintControl;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="SiteDetails.ts"/>
var MarsRover;
(function (MarsRover) {
    var SiteList = (function () {
        function SiteList() {
            this.sitesFile = "Sites/Sites.js";
            this.siteDetailsCache = {};
            this.TravelConnections = [];
        }
        SiteList.prototype.Load = function (done) {
            var t = this;
            $.getJSON(this.sitesFile, null, function (data, textStatus, jqXHR) {
                t.Sites = data.Sites;
                t.LoadSites();
                t.DefaultSite = data.DefaultSite;
                t.SitesData = data;
                t.MinimapName = data.MinimapName;
                t.MinimapLocations = {};
                t.GameDurationSols = data.GameDurationSols;
                if (data.MinimapLocations) {
                    for (var i = 0; i < data.MinimapLocations.length; i++) {
                        var ml = data.MinimapLocations[i];
                        var siteName = ml["Key"];
                        var x = ml["Value"]["_x"];
                        var y = ml["Value"]["_y"];
                        var pt = new Drawing.Point(x, y);
                        t.MinimapLocations[siteName] = pt;
                    }
                }
                t.MinimapWidth = data.MinimapWidth;
                t.MinimapHeight = data.MinimapHeight;

                if (data.TravelConnections) {
                    for (var i = 0; i < data.TravelConnections.length; i++) {
                        var tc = data.TravelConnections[i];
                        t.TravelConnections.push(new TravelConnection(tc));
                    }
                }
                done();
            });
        };

        /*** It must already have been loaded. */
        SiteList.prototype.GetSite = function (siteName) {
            return this.siteDetailsCache[siteName];
        };

        SiteList.prototype.LoadSites = function () {
            var t = this;
            for (var i = 0; i < t.Sites.length; i++) {
                var site = t.Sites[i];
                t.LoadSite(site, function (siteDetails) {
                    t.siteDetailsCache[siteDetails.SiteName] = siteDetails;
                });
            }
        };

        SiteList.prototype.LoadSite = function (siteName, done) {
            if (this.siteDetailsCache[siteName]) {
                done(this.siteDetailsCache[siteName]);
                return;
            }

            var siteDetails = new MarsRover.SiteDetails();
            siteDetails.Load(siteName, function () {
                done(siteDetails);
            });
        };

        SiteList.prototype.LoadDefaultSite = function (done) {
            var t = this;
            t.Load(function () {
                t.LoadSite(t.DefaultSite, done);
            });
        };

        SiteList.prototype.GetTravelConnection = function (A, B) {
            for (var i = 0; i < this.TravelConnections.length; i++) {
                var tc = this.TravelConnections[i];
                if ((tc.SiteNames[0] == A && tc.SiteNames[1] == B) || (tc.SiteNames[0] == B && tc.SiteNames[1] == A))
                    return tc;
            }
            return null;
        };
        return SiteList;
    })();
    MarsRover.SiteList = SiteList;

    var TravelConnection = (function () {
        function TravelConnection(data) {
            this.SiteNames = data.SiteNames;
            this.Sols = data.Sols;
        }
        return TravelConnection;
    })();
    MarsRover.TravelConnection = TravelConnection;
})(MarsRover || (MarsRover = {}));
var MarsRover;
(function (MarsRover) {
    var TypedEvent = (function () {
        function TypedEvent() {
            // Private member vars
            this._listeners = [];
        }
        TypedEvent.prototype.add = function (listener) {
            /// <summary>Registers a new listener for the event.</summary>
            /// <param name="listener">The callback function to register.</param>
            this._listeners.push(listener);
        };
        TypedEvent.prototype.remove = function (listener) {
            /// <summary>Unregisters a listener from the event.</summary>
            /// <param name="listener">The callback function that was registered. If missing then all listeners will be removed.</param>
            if (typeof listener === 'function') {
                for (var i = 0, l = this._listeners.length; i < l; l++) {
                    if (this._listeners[i] === listener) {
                        this._listeners.splice(i, 1);
                        break;
                    }
                }
            } else {
                this._listeners = [];
            }
        };

        TypedEvent.prototype.trigger = function () {
            var a = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                a[_i] = arguments[_i + 0];
            }
            /// <summary>Invokes all of the listeners for this event.</summary>
            /// <param name="args">Optional set of arguments to pass to listners.</param>
            var context = {};
            var listeners = this._listeners.slice(0);
            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(context, a || []);
            }
        };
        return TypedEvent;
    })();
    MarsRover.TypedEvent = TypedEvent;
})(MarsRover || (MarsRover = {}));
///<reference path="SiteList.ts"/>
///<reference path="SiteDetails.ts"/>
///<reference path="TypedEvent.ts"/>
///<reference path="typings/linq/linq.d.ts" />
///<reference path="typings/FileSaver.d.ts" />
var MarsRover;
(function (MarsRover) {
    var GameData = (function () {
        function GameData() {
            this.CurrentSiteChanged = new MarsRover.TypedEvent();
            this.GameLoaded = new MarsRover.TypedEvent();
            this.CurrentSol = new SolData(1);
            this.SolsTaken = [];
            this.ResultsAchieved = [];
        }
        /** End Save Game State*/
        GameData.prototype.CurrentSolNumber = function () {
            return this.CurrentSol.SolNumber;
        };

        GameData.prototype.GetObservation = function (fp, obs) {
            var oData = new ObservationData(fp, obs);

            var baseDuration = 1;
            if (obs.IsAPXS())
                baseDuration = this.AXPSDurationSols;
            else if (obs.IsMB())
                baseDuration = this.MBDurationSols;
            else if (obs.IsMiniTES())
                baseDuration = this.MiniTESDurationSols;
            else if (obs.IsPanCam())
                baseDuration = this.PanCamDurationSols;
            else if (obs.IsMI())
                baseDuration = this.MIDurationSols;
            else if (obs.IsRAT())
                baseDuration = this.RATDurationSols;
            oData.Duration = Math.round(baseDuration * obs.SolMultiplier * 10);
            return oData;
        };

        GameData.prototype.AddObservation = function (obs) {
            for (var i in this.CurrentSol.Observations) {
                var existingObs = this.CurrentSol.Observations[i];
                if (obs.observation == existingObs.observation)
                    return "That observation is already in your queue!";
            }

            if (obs.Duration + this.CurrentSol.GetDuration() > 10)
                return "Not enough time this sol!";

            this.CurrentSol.Observations.push(obs);
            return "";
        };

        /** Save game to html5 local storage */
        GameData.prototype.Autosave = function () {
            if (typeof (Storage) === "undefined")
                return;

            localStorage.setItem("autosave", this.GetSaveGameJSON());
        };

        GameData.prototype.LoadAutosave = function () {
            if (typeof (Storage) === "undefined")
                return;

            var jsonString = localStorage.getItem("autosave");
            this.LoadGame(jsonString);
        };

        GameData.prototype.StartOver = function (done) {
            var _this = this;
            if (typeof done === "undefined") { done = null; }
            this.CurrentSol = new SolData(1);
            this.SolsTaken = [];
            this.ResultsAchieved = [];
            this.Load(function () {
                $("#solCount").text(_this.CurrentSolNumber());
                _this.Autosave();
                _this.GameLoaded.trigger();
                if (done)
                    done();
            });
        };

        GameData.prototype.LoadGame = function (jsonSaveGame) {
            if (!jsonSaveGame)
                return;
            var state = JSON.parse(jsonSaveGame);
            if (!state || !state.CurrentSiteName)
                return;
            this.LoadSite(state.CurrentSiteName);
            this.SolsTaken = [];
            for (var i = 0; i < state.SolsTaken.length; i++) {
                this.SolsTaken.push(SolData.FromJSON(state.SolsTaken[i], this));
            }
            this.CurrentSol = SolData.FromJSON(state.CurrentSol, this);
            this.ResultsAchieved = state.ResultsAchieved;
            $("#solCount").text(this.CurrentSolNumber());
            this.GameLoaded.trigger();
        };

        GameData.prototype.GetSaveGameJSON = function () {
            var state = new SaveGameState();
            state.CurrentSiteName = this.CurrentSiteDetails.SiteName;
            state.CurrentSol = this.CurrentSol;
            state.ResultsAchieved = this.ResultsAchieved;
            state.SolsTaken = this.SolsTaken;
            var jsonString = JSON.stringify(state);
            return jsonString;
        };

        /** Gives user a download save as dialog for the save game */
        GameData.prototype.SaveGame = function () {
            var blob = new Blob([this.GetSaveGameJSON()], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "SaveGame.json");
        };

        GameData.prototype.TravelToSite = function (siteName) {
            var siteDetails = this.siteList.GetSite(siteName);
            this.CurrentSol.SkipDataReview = true;
            var tc = this.siteList.GetTravelConnection(this.CurrentSiteDetails.SiteName, siteName);
            this.SolsTaken.push(this.CurrentSol);
            for (var c = tc.Sols - 1; c > 0; c--) {
                var sd = new SolData(this.CurrentSolNumber() + 1);
                this.CurrentSol = sd;
                sd.IsTraveling = true;
                sd.SkipDataReview = true;
                this.SolsTaken.push(sd);
            }
            this.CurrentSol.SkipDataReview = false;
            this.CurrentSol.TravelTime = tc.Sols;
            this.CurrentSol.IsTraveling = true;
            this.CurrentSol.SiteName = siteDetails.SiteName;
            this.CurrentSol.SiteIntroduction = siteDetails.Introduction;
            this.CurrentSol = new SolData(this.CurrentSolNumber() + 1);
            this.CurrentSol.SiteName = this.GetCurrentSite().SiteName;
            $("#solCount").text(this.CurrentSolNumber());

            this.LoadSite(siteName);
        };

        GameData.prototype.MoveToNextSol = function (justification) {
            this.CurrentSol.SiteName = this.GetCurrentSite().SiteName;
            this.CurrentSol.Justification = justification;
            this.SolsTaken.push(this.CurrentSol);
            this.CurrentSol = new SolData(this.CurrentSolNumber() + 1);
            this.CurrentSol.SiteName = this.GetCurrentSite().SiteName;
            $("#solCount").text(this.CurrentSolNumber());
            this.CheckResults();
        };

        /** Has this observation been made on a prior sol? */
        GameData.prototype.HasTakenObservation = function (observationName) {
            for (var i = 0; i < this.SolsTaken.length; i++) {
                var solData = this.SolsTaken[i];
                if (Enumerable.From(solData.Observations).Any(function (x) {
                    return x.observation.Name == observationName;
                }))
                    return true;
            }
            return false;
        };

        GameData.prototype.HasMetResult = function (resultName) {
            var t = this;
            return Enumerable.From(this.ResultsAchieved).Any(function (r) {
                return r.Name == resultName;
            });
        };

        GameData.prototype.CheckResults = function () {
            Enumerable.From(this.Results).ForEach(function (r) {
                if (this.HasMetResult(r.Name))
                    return;

                if (this.CheckResultConditions(r.AchievementConditions))
                    this.ResultsAchieved.push(r);

                return null;
            });
        };

        GameData.prototype.CheckResultConditions = function (r) {
            return Enumerable.From(r.AchievementConditions).Any(function (conditions) {
                var _this = this;
                return Enumerable.From(conditions).All(function (c) {
                    return _this.HasMetCondition(c);
                });
            });
        };

        GameData.prototype.HasMetCondition = function (cond) {
            return this.HasTakenObservation(cond) || this.HasMetResult(cond);
        };

        /** Are all the appearswhen conditions met? */
        GameData.prototype.IsVisible = function (obs) {
            var t = this;
            if (this.HasTakenObservation(obs.Name))
                return false;
            if (!obs.AppearanceConditions || obs.AppearanceConditions.length == 0)
                return true;
            return Enumerable.From(obs.AppearanceConditions).All(function (cond) {
                return t.HasMetCondition(cond);
            });
        };

        GameData.prototype.GetSol = function (solNumber) {
            for (var i in this.SolsTaken) {
                var sol = this.SolsTaken[i];
                if (sol.SolNumber == solNumber)
                    return sol;
            }
            return null;
        };

        GameData.prototype.GetCurrentCamera = function () {
            return this.GetCurrentSite().CurrentCamera;
        };

        GameData.prototype.GetCurrentSite = function () {
            return this.CurrentSiteDetails;
        };

        GameData.prototype.SetCurrentSite = function (siteDetails) {
            this.CurrentSiteDetails = siteDetails;
            this.CurrentSiteChanged.trigger();
        };

        GameData.prototype.IsOnNavCam = function () {
            var site = this.GetCurrentSite();
            var camera = site.CurrentCamera;
            return site.NavCamImage == camera;
        };

        GameData.prototype.IsOnFrontHazCam = function () {
            var site = this.GetCurrentSite();
            var camera = site.CurrentCamera;
            return site.FrontHazCamImage == camera;
        };

        GameData.prototype.IsOnRearHazCam = function () {
            var site = this.GetCurrentSite();
            var camera = site.CurrentCamera;
            return site.RearHazCamImage == camera;
        };

        GameData.prototype.Load = function (done) {
            if (typeof done === "undefined") { done = null; }
            var t = this;
            t.siteList = new MarsRover.SiteList();

            t.siteList.LoadDefaultSite(function (siteDetails) {
                t.LoadData();
                t.CurrentSiteDetails = siteDetails;
                if (done)
                    done();
            });
        };

        GameData.prototype.LoadSite = function (siteName) {
            var t = this;
            t.siteList.LoadSite(siteName, function (siteDetails) {
                t.SetCurrentSite(siteDetails);
            });
        };

        GameData.prototype.LoadData = function () {
            this.VictoryParameters = this.siteList.SitesData.VictoryParameters;
            this.GameDurationSols = this.siteList.SitesData.GameDurationSols;
            this.MiniTESDurationSols = this.siteList.SitesData.MiniTESDurationSols;
            this.PanCamDurationSols = this.siteList.SitesData.PanCamDurationSols;
            this.MBDurationSols = this.siteList.SitesData.MBDurationSols;
            this.AXPSDurationSols = this.siteList.SitesData.AXPSDurationSols;
            this.MIDurationSols = this.siteList.SitesData.MIDurationSols;
            this.RATDurationSols = this.siteList.SitesData.RATDurationSols;
            this.Results = [];
            for (var i = 0; i < this.siteList.SitesData.Results.length; i++) {
                var r = this.siteList.SitesData.Results[i];
                this.Results.push(new Result(r));
            }
        };
        return GameData;
    })();
    MarsRover.GameData = GameData;

    var Result = (function () {
        function Result(data) {
            this.Name = data.Name;
            this.Description = data.Description;
            this.AchievementConditions = data.AchievementConditions;
        }
        return Result;
    })();
    MarsRover.Result = Result;

    var SolData = (function () {
        function SolData(solNumber) {
            this.SolNumber = solNumber;
            this.Observations = [];
        }
        SolData.FromJSON = function (data, gameData) {
            var sd = new SolData(data.SolNumber);
            sd.Justification = data.Justification;
            sd.SiteIntroduction = data.SiteIntroduction;
            sd.SkipDataReview = data.SkipDataReview;
            sd.TravelTime = data.TravelTime;
            sd.SiteName = data.SiteName;
            sd.IsTraveling = data.IsTraveling;
            for (var i = 0; i < data.Observations.length; i++) {
                var obsData = data.Observations[i];
                var fp = new MarsRover.Footprint(obsData.footprint);
                var obs = new MarsRover.Observation(obsData.observation);
                sd.Observations.push(gameData.GetObservation(fp, obs));
            }

            return sd;
        };

        SolData.prototype.GetDuration = function () {
            var duration = 0;
            for (var i in this.Observations) {
                duration += this.Observations[i].Duration;
            }
            return duration;
        };
        return SolData;
    })();
    MarsRover.SolData = SolData;

    var ObservationData = (function () {
        //Do not use! Call GameData.GetObservation instead!
        function ObservationData(footprint, observation) {
            this.footprint = footprint;
            this.observation = observation;
        }
        return ObservationData;
    })();
    MarsRover.ObservationData = ObservationData;

    var SaveGameState = (function () {
        function SaveGameState() {
        }
        return SaveGameState;
    })();
    MarsRover.SaveGameState = SaveGameState;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
var MarsRover;
(function (MarsRover) {
    var ToolTip = (function () {
        function ToolTip() {
        }
        ToolTip.SetToolTip = function (j, msg) {
            j.mouseenter(function (e) {
                if (msg && msg !== '')
                    ToolTip.Show(msg, e.pageX, e.pageY);
            });
            j.mouseleave(function (e) {
                ToolTip.Hide();
            });
        };

        ToolTip.Show = function (msg, x, y) {
            $("#toolTipDiv").remove();
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();

            var toolTipDiv = $('<div id="toolTipDiv" class="tipsy"></div>').html('<div class="tipsy-inner"></div>');
            toolTipDiv.prependTo(document.body);
            toolTipDiv.find("div.tipsy-inner").html(msg);

            var toolTipWidth = toolTipDiv.width();
            var toolTipHeight = toolTipDiv.height();

            if (x + toolTipWidth > windowWidth)
                x = x - toolTipWidth - 20;
            if (y + toolTipHeight > windowHeight)
                y = y - toolTipHeight - 20;

            toolTipDiv.offset({ top: y + 10, left: x + 10 });
            toolTipDiv.show();
        };

        ToolTip.Hide = function () {
            $("#toolTipDiv").remove();
        };
        return ToolTip;
    })();
    MarsRover.ToolTip = ToolTip;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/lodash.d.ts" />
var MarsRover;
(function (MarsRover) {
    var ZoomControl = (function () {
        function ZoomControl() {
            this.zoomArray = [.125, .25, .5, .75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10];
            this.minZoom = 0;
            this.customFactors = [];
            this.zoomIndex = this.GetZoomIndex(1);
            this.backupZoomArray = [];
            this.CopyArray(this.zoomArray, this.backupZoomArray);
        }
        ZoomControl.prototype.CopyArray = function (source, target) {
            target.length = 0;
            for (var i = 0; i < source.length; i++) {
                target.push(source[i]);
            }
        };

        ZoomControl.prototype.GetZoomIndex = function (zoomFactor) {
            for (var i = 0; i < this.zoomArray.length; i++) {
                var zf = this.zoomArray[i];
                if (zf === zoomFactor)
                    return i;
            }
            return -1;
        };

        /* Set the min zoom */
        ZoomControl.prototype.SetMinZoom = function (zFactor) {
            var idx = this.GetZoomIndex(zFactor);
            if (idx < 0) {
                this.AddCustomZoomFactor(zFactor);
            }
            this.minZoom = zFactor;
        };

        ZoomControl.prototype.SetZoomFactor = function (zFactor) {
            var idx = this.GetZoomIndex(zFactor);
            if (idx < 0) {
                this.AddCustomZoomFactor(zFactor);
            }

            this.zoomIndex = this.GetZoomIndex(zFactor);
        };

        ZoomControl.prototype.AddCustomZoomFactor = function (zFactor) {
            var t = this;
            t.customFactors.push(zFactor);
            var oldFactor = t.GetZoomFactor();

            t.CopyArray(t.backupZoomArray, t.zoomArray);

            _.each(t.customFactors, function (cFactor) {
                var min = _.min(t.zoomArray, function (x) {
                    return Math.abs(x - cFactor);
                });
                var idx = _.indexOf(t.zoomArray, min);
                var numToReplace = _.contains(t.customFactors, t.zoomArray[idx]) ? 0 : 1;
                t.zoomArray.splice(idx, numToReplace, cFactor);
                if (idx + 1 < t.zoomArray.length && t.zoomArray[idx + 1] < t.zoomArray[idx]) {
                    t.zoomArray[idx] = t.zoomArray[idx + 1];
                    t.zoomArray[idx + 1] = cFactor;
                }
            });
            this.zoomIndex = this.GetZoomIndex(oldFactor);
        };

        ZoomControl.prototype.GetInsertIndex = function (zFactor) {
            if (zFactor < this.zoomArray[0])
                return 0;
            if (zFactor > this.zoomArray[this.zoomArray.length - 1])
                return this.zoomArray.length;
            for (var i = 1; i < this.zoomArray.length; i++) {
                var zf = this.zoomArray[i];
                if (zFactor < zf)
                    return i;
            }
        };

        ZoomControl.prototype.GetZoomFactor = function () {
            return this.zoomArray[this.zoomIndex];
        };

        ZoomControl.prototype.ZoomIn = function () {
            this.zoomIndex = Math.min(this.zoomArray.length - 1, this.zoomIndex + 1);
        };

        ZoomControl.prototype.ZoomOut = function () {
            var nextIdx = Math.max(0, this.zoomIndex - 1);
            if (this.zoomArray[nextIdx] >= this.minZoom)
                this.zoomIndex = nextIdx;
        };

        ZoomControl.prototype.AddZoomControl = function ($parentDiv, onZoomIn, onZoomOut) {
            var t = this;
            $parentDiv.append('<div class="zoomContainer">' + '<div class="zoomIn" />' + '<div class="zoomOut" />' + '</div>');

            $parentDiv.find("div.zoomIn").mousedown(function (e) {
                t.ZoomIn();
                onZoomIn();
                e.preventDefault();
                return false;
            });

            $parentDiv.find("div.zoomOut").mousedown("click", function (e) {
                t.ZoomOut();
                onZoomOut();
                e.preventDefault();
                return false;
            });
        };
        return ZoomControl;
    })();
    MarsRover.ZoomControl = ZoomControl;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/lodash.d.ts" />
var MarsRover;
(function (MarsRover) {
    var Util = (function () {
        function Util() {
        }
        /** $img is a jquery image object, onLoad will be called when the image is loaded, or right away if it already is. */
        Util.OnImageLoad = function ($img, onLoad) {
            var img = $img[0];
            var imgLoaded = false;
            var onImageLoad = function () {
                if (imgLoaded)
                    return;
                imgLoaded = true;
                onLoad();
            };

            if (img.complete) {
                onImageLoad();
            }

            $img.load(onImageLoad);
        };

        Util.GetImageSize = function (imgSrc, onLoad) {
            var img = new Image();
            img.onload = function () {
                var height = img.height;
                var width = img.width;
                onLoad(new Size(width, height));
            };
            img.src = imgSrc;
        };

        Util.FitToDimensions = function (width, height, availableWidth, availableHeight) {
            var fittedHeight = Math.floor(height / width * availableWidth);
            if (fittedHeight <= availableHeight)
                return new Size(width, fittedHeight);
            var fittedWidth = Math.floor(width / height * availableHeight);
            return new Size(fittedWidth, height);
        };

        Util.GetFileName = function (filePath) {
            var idx = _.findIndex(filePath, function (x) {
                return x === '/' || x === '\\';
            });
            if (idx < 0 || idx + 1 >= filePath.length)
                return 'unknown';
            return filePath.substring(idx + 1);
        };

        Util.DownloadFile = function (filePath, suggestedName, fileType) {
            if (typeof suggestedName === "undefined") { suggestedName = null; }
            if (typeof fileType === "undefined") { fileType = "image/jpeg"; }
            suggestedName = suggestedName || Util.GetFileName(filePath);
            var xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function (e) {
                var arrayBufferView = new Uint8Array(this.response);
                var blob = new Blob([arrayBufferView], { type: fileType });
                var w = window;
                w.saveAs(blob, suggestedName);
            };

            xhr.send();
        };

        Util.Clamp = function (val, min, max) {
            return Math.max(min, Math.min(val, max));
        };

        Util.SimulateClick = function (element) {
            Util.FireHtmlEvent(element, "click");
        };

        Util.FireHtmlEvent = function (element, eventType) {
            if (element.length)
                element = element[0];
            if (element.fireEvent) {
                (element.fireEvent('on' + eventType));
            } else {
                var evObj = document.createEvent('Events');
                evObj.initEvent(eventType, true, false);
                element.dispatchEvent(evObj);
            }
        };
        return Util;
    })();
    MarsRover.Util = Util;

    var Size = (function () {
        function Size(width, height) {
            this.Width = width;
            this.Height = height;
        }
        return Size;
    })();
    MarsRover.Size = Size;

    var Rect = (function () {
        function Rect(top, left, width, height) {
            this.Top = top;
            this.Left = left;
            this.Width = width;
            this.Height = height;
        }
        return Rect;
    })();
    MarsRover.Rect = Rect;
})(MarsRover || (MarsRover = {}));
///<reference path="GameData.ts"/>
///<reference path="SiteList.ts"/>
///<reference path="SiteDetails.ts"/>
///<reference path="typings/raphael/raphael.d.ts"/>
///<reference path="Drawing/DrawingObject.ts" />
///<reference path="Drawing/SVGArea.ts" />
///<reference path="FootprintControl.ts" />
///<reference path="ToolTip.ts" />
///<reference path="ZoomControl.ts" />
///<reference path="Util.ts" />
var MarsRover;
(function (MarsRover) {
    var Viewport = (function () {
        function Viewport(elementID, gameData) {
            this.SelectedFootprintChanged = new MarsRover.TypedEvent();
            this.ViewPositionChanged = new MarsRover.TypedEvent();
            this.CameraChanged = new MarsRover.TypedEvent();
            this.ZoomChanged = new MarsRover.TypedEvent();
            this.zoomControl = new MarsRover.ZoomControl();
            this.elementID = elementID;
            this.gameData = gameData;
            this.viewPort = $("#" + elementID);
            this.viewPortDiv = this.viewPort[0];

            this.viewPort.append("<div id='marsImage'></div>");
            $("#marsImage").disableSelection();
            this.imgContainer = $("#marsImage")[0];

            this.svgArea = new Drawing.SVGArea(this.viewPortDiv);

            this.topLeft = new Drawing.Point();
            var t = this;

            this.viewPort.mousedown(function (e) {
                t.OnMouseDown(e);
            });

            if (this.viewPortDiv.releaseCapture)
                this.viewPort.mousemove(function (e) {
                    t.OnViewportMouseMove(e);
                });
            else
                $(window).mousemove(function (e) {
                    t.OnViewportMouseMove(e);
                });

            $(window).mouseup(function (e) {
                t.OnViewportMouseUp(e);
            });

            //$(window).mouseleave(function (e) { t.OnViewportMouseUp(e); });
            var onZoomedFunc = function () {
                t.RefreshScreen(false);
                t.ZoomChanged.trigger();
            };

            this.zoomControl.AddZoomControl($("#imageArea"), onZoomedFunc, onZoomedFunc);

            t.drawFootprints();
            t.refresh();
        }
        Viewport.prototype.SetNavCam = function () {
            var cs = this.gameData.GetCurrentSite();
            if (!cs.NavCamImage || cs.CurrentCamera === cs.NavCamImage)
                return;
            cs.CurrentCamera = cs.NavCamImage;
            this.RefreshScreen();
            this.ViewPositionChanged.trigger();
            this.SelectFootprint(null);
            this.ZoomToScreenWidth();
        };

        Viewport.prototype.ClearSelection = function () {
            this.SelectFootprint(null);
        };

        Viewport.prototype.ClearScreen = function (resetPosition) {
            if (typeof resetPosition === "undefined") { resetPosition = true; }
            if (resetPosition)
                this.topLeft = new Drawing.Point();
            for (var key in this.visibleImages) {
                var img = this.visibleImages[key];
                img.image.remove();
            }
            this.visibleImages = [];
        };

        /** Returns a Rect with scaled coordinates all between 0-1 */
        Viewport.prototype.GetViewportPosition = function () {
            var zf = this.GetZoomFactor();
            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();
            var top = this.topLeft.Y;
            var left = this.topLeft.X;
            var width = viewWidth / zf;
            var height = viewHeight / zf;

            var camera = this.gameData.GetCurrentSite().CurrentCamera;

            return new MarsRover.Rect(top / camera.ImageHeight, left / camera.ImageWidth, width / camera.ImageWidth, height / camera.ImageHeight);
        };

        Viewport.prototype.SetViewportPosition = function (xPercent, yPercent) {
            var camera = this.gameData.GetCurrentSite().CurrentCamera;

            var newX = camera.ImageWidth * xPercent;
            var newY = camera.ImageHeight * yPercent;
            this.topLeft.X = newX;
            this.topLeft.Y = newY;
            this.CheckViewportBounds();
            this.refresh();
        };

        Viewport.prototype.GetZoomFactor = function () {
            return this.zoomControl.GetZoomFactor();
        };

        Viewport.prototype.SetZoomFactor = function (zFactor) {
            this.zoomControl.SetZoomFactor(zFactor);
            this.RefreshScreen();
            this.ZoomChanged.trigger();
        };

        Viewport.prototype.ZoomToScreenWidth = function () {
            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();
            var camera = this.gameData.GetCurrentSite().CurrentCamera;
            var zoomToWidthFactor = viewWidth / camera.ImageWidth;
            var zoomToHeightFactor = viewHeight / camera.ImageHeight;
            var minZoom = Math.min(zoomToWidthFactor, zoomToHeightFactor);
            this.zoomControl.SetMinZoom(minZoom);
            this.SetZoomFactor(minZoom);
        };

        Viewport.prototype.ZoomIn = function () {
            this.zoomControl.ZoomIn();
            this.RefreshScreen(false);
            this.ZoomChanged.trigger();
        };

        Viewport.prototype.ZoomOut = function () {
            this.zoomControl.ZoomOut();
            this.RefreshScreen(false);
            this.ZoomChanged.trigger();
        };

        Viewport.prototype.SetFrontHazCam = function () {
            var cs = this.gameData.GetCurrentSite();
            if (!cs.FrontHazCamImage || cs.CurrentCamera === cs.FrontHazCamImage)
                return;
            cs.CurrentCamera = cs.FrontHazCamImage;
            this.topLeft = new Drawing.Point();
            this.RefreshScreen();
            this.ViewPositionChanged.trigger();
            this.SelectFootprint(null);
            this.ZoomToScreenWidth();
        };

        Viewport.prototype.SetRearHazCam = function () {
            var cs = this.gameData.GetCurrentSite();
            if (!cs.RearHazCamImage || cs.CurrentCamera === cs.RearHazCamImage)
                return;
            cs.CurrentCamera = cs.RearHazCamImage;
            this.topLeft = new Drawing.Point();
            this.RefreshScreen();
            this.ViewPositionChanged.trigger();
            this.SelectFootprint(null);
            this.ZoomToScreenWidth();
        };

        Viewport.prototype.RefreshScreen = function (resetPosition) {
            if (typeof resetPosition === "undefined") { resetPosition = true; }
            this.ClearScreen(resetPosition);
            this.ClearFootprints();
            this.CheckViewportBounds();
            this.drawFootprints();
            this.refresh();
        };

        Viewport.prototype.ClearFootprints = function () {
            for (var i = 0; i < this.footprints.length; i++) {
                var fp = this.footprints[i];
                fp.Hide();
            }
            this.footprints = [];
        };

        Viewport.prototype.OnMouseDown = function (e) {
            this.dragging = true;
            MarsRover.ToolTip.Hide();
            if (this.viewPortDiv.setCapture)
                this.viewPortDiv.setCapture();
            this.startOffset = new Drawing.Point(this.topLeft.X, this.topLeft.Y);
            this.anchor = new Drawing.Point(e.pageX, e.pageY);
            e.preventDefault();
            return false;
        };

        Viewport.prototype.OnViewportMouseUp = function (e) {
            if (this.viewPortDiv.releaseCapture)
                this.viewPortDiv.releaseCapture();
            this.dragging = false;
        };

        Viewport.prototype.OnViewportMouseMove = function (e) {
            if (!this.dragging)
                return;

            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();

            var delta = { x: e.pageX - this.anchor.X, y: e.pageY - this.anchor.Y };
            var newX = this.startOffset.X - delta.x / this.GetZoomFactor();
            var newY = this.startOffset.Y - delta.y / this.GetZoomFactor();
            this.topLeft.X = newX;
            this.topLeft.Y = newY;
            this.CheckViewportBounds();
            this.refresh();
            this.ViewPositionChanged.trigger();
        };

        Viewport.prototype.CheckViewportBounds = function () {
            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();
            var camera = this.gameData.GetCurrentSite().CurrentCamera;
            this.topLeft.X = this.clamp(this.topLeft.X, 0, camera.ImageWidth - viewWidth / this.GetZoomFactor());
            this.topLeft.Y = this.clamp(this.topLeft.Y, 0, camera.ImageHeight - viewHeight / this.GetZoomFactor());
        };

        Viewport.prototype.clamp = function (val, min, max) {
            return Math.max(min, Math.min(val, max));
        };

        Viewport.prototype.drawFootprints = function () {
            var camera = this.gameData.GetCurrentSite().CurrentCamera;
            this.footprints = [];
            for (var i = 0; i < camera.Footprints.length; i++) {
                var fp = camera.Footprints[i];

                var footPrint = this.CreateFootprint(fp);
                if (this.selectedFootprint && this.selectedFootprint.GetFootprint() === fp) {
                    this.selectedFootprint = footPrint;
                    this.selectedFootprint.SetSelected(true);
                }
                this.footprints.push(footPrint);
                this.svgArea.AddChild(footPrint);
                var pathElement = footPrint.GetPath();
                this.AddMouseFunctions(pathElement, footPrint);
            }
            var t = this;
        };

        Viewport.prototype.AddMouseFunctions = function (pathElement, footPrint) {
            var t = this;
            $(pathElement).mouseover(function (e) {
                t.OnPathMouseOver(e);
            }).mouseout(function (e) {
                t.OnPathMouseOut(e);
            }).mousedown(function (e) {
                t.OnPathMouseDown(e, footPrint);
            });
        };

        Viewport.prototype.OnPathMouseDown = function (e, footprint) {
            this.SelectFootprint(footprint);
        };

        Viewport.prototype.SelectFootprint = function (footprint) {
            if (this.selectedFootprint == footprint)
                return;

            if (this.selectedFootprint)
                this.selectedFootprint.SetSelected(false);
            this.selectedFootprint = footprint;
            if (this.selectedFootprint)
                this.selectedFootprint.SetSelected(true);

            this.SelectedFootprintChanged.trigger();
        };

        Viewport.prototype.GetSelectedFootprint = function () {
            return this.selectedFootprint;
        };

        Viewport.prototype.OnPathMouseOver = function (e) {
            var toolTip = $(e.toElement).attr("data-title");
            MarsRover.ToolTip.Show(toolTip, e.pageX, e.pageY);
        };

        Viewport.prototype.OnPathMouseOut = function (e) {
            MarsRover.ToolTip.Hide();
        };

        Viewport.prototype.CreateFootprint = function (footprint) {
            var f = new MarsRover.FootprintControl(footprint, this.GetZoomFactor());
            f.ToolTip = footprint.Description;
            return f;
        };

        Viewport.prototype.refresh = function () {
            var camera = this.gameData.GetCurrentSite().CurrentCamera;

            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();

            var zoomFactor = this.GetZoomFactor();

            var zoomedImageWidth = camera.XStep * zoomFactor;
            var zoomedImageHeight = camera.YStep * zoomFactor;

            var zoomedLeft = this.topLeft.X * zoomFactor;
            var zoomedRight = zoomedLeft + viewWidth;
            var zoomedTop = this.topLeft.Y * zoomFactor;
            var zoomedBottom = zoomedTop + viewHeight;

            var xLength = Math.ceil(camera.ImageWidth / camera.XStep);
            var yLength = Math.ceil(camera.ImageHeight / camera.YStep);

            var xStartIndex = Math.floor(zoomedLeft / zoomedImageWidth);
            var yStartIndex = Math.floor(zoomedTop / zoomedImageHeight);
            var xEndIndex = Math.floor(zoomedRight / zoomedImageWidth) + 1;
            var yEndIndex = Math.floor(zoomedBottom / zoomedImageHeight) + 1;

            xEndIndex = Math.min(xEndIndex, xLength - 1);
            yEndIndex = Math.min(yEndIndex, yLength - 1);

            var stillVisibleList = [];
            for (var key in this.visibleImages) {
                var img = this.visibleImages[key];

                if (this.IsOnScreen(img)) {
                    stillVisibleList.push(img);
                } else {
                    img.image.remove();
                }
            }
            this.visibleImages = stillVisibleList;

            var viewportOffset = this.viewPort.offset();

            for (var xIdx = xStartIndex; xIdx <= xEndIndex; xIdx++) {
                var x = xIdx * camera.XStep;
                for (var yIdx = yStartIndex; yIdx <= yEndIndex; yIdx++) {
                    var y = yIdx * camera.YStep;
                    var img = this.CreateOrGetImage(x, y);
                    if (!img.added)
                        img.image.appendTo(this.imgContainer);
                    img.added = true;
                    var xPosition = viewportOffset.left + (x - this.topLeft.X) * zoomFactor;
                    var yPosition = viewportOffset.top + (y - this.topLeft.Y) * zoomFactor;
                    img.image.offset({ top: yPosition, left: xPosition });
                }
            }

            for (var idx in this.footprints) {
                var fp = this.footprints[idx];
                fp.SetOffset(this.topLeft.Times(zoomFactor));
                if (this.IsVisible(fp))
                    fp.Show();
                else
                    fp.Hide();
            }
        };

        Viewport.prototype.IsOnScreen = function (img) {
            var camera = this.gameData.GetCurrentSite().CurrentCamera;
            var viewWidth = this.viewPort.width();
            var viewHeight = this.viewPort.height();

            var zoomFactor = this.GetZoomFactor();

            var left = img.x * zoomFactor;
            var top = img.y * zoomFactor;
            var right = left + camera.XStep * zoomFactor;
            var bottom = top + camera.YStep * zoomFactor;

            var viewportLeft = this.topLeft.X * zoomFactor;
            var viewportRight = viewportLeft + viewWidth * zoomFactor;
            var viewportTop = this.topLeft.Y * zoomFactor;
            var viewportBottom = viewportTop + viewHeight * zoomFactor;

            if (right < viewportLeft || viewportRight < left)
                return false;
            if (bottom < viewportTop || viewportBottom < top)
                return false;
            return true;
        };

        /** Footprint is visible if any of the observations are visible */
        Viewport.prototype.IsVisible = function (fp) {
            var footprint = fp.GetFootprint();
            var obsList = footprint.Observations;
            for (var i = 0; i < obsList.length; i++) {
                var obs = obsList[i];
                if (this.gameData.IsVisible(obs))
                    return true;
            }
            return false;
        };

        Viewport.prototype.CreateOrGetImage = function (x, y) {
            var camera = this.gameData.GetCurrentSite().CurrentCamera;

            var right = Math.min(camera.ImageWidth, x + camera.XStep);
            var bottom = Math.min(camera.ImageHeight, y + camera.YStep);

            var w = (right - x) * this.GetZoomFactor();
            var h = (bottom - y) * this.GetZoomFactor();

            var img = this.GetImage(x, y);
            if (!img) {
                var siteDetails = this.gameData.GetCurrentSite();
                var camera = siteDetails.CurrentCamera;
                var imgSource = siteDetails.ImageDirectory + "/" + camera.ImageBaseName + "." + x + "." + y + camera.ImageExtension;
                var image = $('<img />', { 'src': imgSource, 'width': w, 'height': h }).css({ 'position': 'absolute' }).disableSelection();
                img = {
                    x: x,
                    y: y,
                    imgSource: imgSource,
                    image: image,
                    added: false
                };

                this.visibleImages.push(img);
            }
            return img;
        };

        Viewport.prototype.GetImage = function (x, y) {
            for (var key in this.visibleImages) {
                var img = this.visibleImages[key];
                if (img.x === x && img.y === y)
                    return img;
            }
            return;
        };
        return Viewport;
    })();
    MarsRover.Viewport = Viewport;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
var MarsRover;
(function (MarsRover) {
    var ModalDialog = (function () {
        function ModalDialog() {
            this.dragging = false;
        }
        ModalDialog.ShowMenuDialog = function (save, restore, restart, download) {
            var html = '<div id="modal">' + '<div id="modalInner">' + '<h1> Menu </h1>' + '<div id="saveButton" class="button">' + '<img src="images/textSaveGame.png" />' + '</div>' + '<div id="restoreButton" class="button">' + '<input class="filePicker" type="file" id="fileInput" name="fileInput">' + '<div class="fakefile">' + '<div class="fileButton">' + '<img src="images/textRestore.png" />' + '</div>' + '</div>' + '</div>' + '<div id="restartButton" class="button">' + '<img src="images/textRestart.png" />' + '</div>' + '<div id="downloadButton" class="button">' + '<img src="images/textDownload.png" />' + '</div>' + '<div id="redXButton" class="button">' + '<img src="images/x_close.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            function getFileContents(file, done) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    done(evt.target.result);
                };
                reader.onerror = function (evt) {
                    done();
                };
                reader.readAsText(file, "UTF-8");
            }

            var closeFunction = function (e) {
                ModalDialog.Hide();
            };

            function handleFileSelect(evt) {
                var files = evt.target.files;
                var f = files[0];

                // files is a FileList of File objects. List some properties.
                var output = [];

                getFileContents(f, function (fileContents) {
                    fileContents = fileContents || "error reading file";
                    restore(fileContents);
                    closeFunction();
                });
            }

            $('#fileInput')[0].addEventListener('change', handleFileSelect, false);

            $('#saveButton').click(function () {
                save();
                closeFunction();
            });
            $('#restartButton').click(function () {
                restart();
                closeFunction();
            });
            $('#downloadButton').click(function () {
                download();
                closeFunction();
            });

            $("#redXButton").click(closeFunction);
            ModalDialog.AddKeyboard(closeFunction, closeFunction);

            ModalDialog.Center(400, 215);
        };

        ModalDialog.ShowRunDialog = function (run, cancel) {
            if (typeof cancel === "undefined") { cancel = null; }
            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + '<h1>Run Instruments!</h1>' + '<div id="cancelButton" class="button">' + '<img src="images/textCancel.png" />' + '</div>' + '<div id="queueButton" class="button">' + '<img src="images/textUplink.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var okFunction = function (e) {
                if ($("#queueButton").hasClass("disabled"))
                    return;

                var justification = $("#justificationBox").val();
                ModalDialog.Hide();
                run(justification);
            };

            var cancelFunction = function (e) {
                ModalDialog.Hide();
                if (cancel)
                    cancel();
            };

            $("#queueButton").click(okFunction).addClass("disabled");
            $("#cancelButton").click(cancelFunction);
            ModalDialog.AddKeyboard(okFunction, cancelFunction);

            ModalDialog.Center();
            //$("#justificationBox").on("input", function ()
            //{
            //    $("#queueButton").removeClass("disabled");
            //    var justification = $("#justificationBox").val();
            //    if (justification == "")
            //        $("#queueButton").addClass("disabled");
            //});
            //setTimeout(function ()
            //{
            //    $("#justificationBox").focus();
            //}, 10);
        };

        ModalDialog.Center = function (width, height) {
            if (typeof width === "undefined") { width = 600; }
            if (typeof height === "undefined") { height = 300; }
            var w = $(window).width();
            var h = $(window).height();
            var m = $("#modalInner");
            m.width(width);
            m.height(height);

            var l = (w - 600) / 2;
            var t = (h - 300) / 2;
            m.offset({ top: t, left: l });
        };

        /** config = { 'name': name, 'description': description, 'imgSrc': imgSource, 'onClosed': null, 'onScroll': null, zoomChanged': null, 'dontUpdateOrigDimensions': false } */
        ModalDialog.ShowScrollableImageDialog = function (config) {
            var html = '<div id="modal">' + '<div id="modalInner">' + '<h1>' + config.name + '</h1>' + '<h3>' + config.description + '</h3>' + '<div id="modalImageScroller"><img id="scrollableImage" src="' + config.imgSrc + '" /></div>' + '<div id="closeButton" class="button">' + '<img src="images/textClose.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var h3 = $("#modalInner").find("h3");
            var top = h3.offset().top + h3.height() - $("#modalInner").offset().top;
            $("#modalImageScroller").css("top", top + 5);
            $("#scrollableImage").disableSelection();

            var modal = new ModalDialog();
            modal.topLeft = new Drawing.Point(0, 0);

            var zoomControl = new MarsRover.ZoomControl();

            var onZoomed = function () {
                scaleImage();
            };
            zoomControl.AddZoomControl($("#modalImageScroller"), onZoomed, onZoomed);

            var okFunction = function (e) {
                ModalDialog.Hide();
                if (config.onClosed)
                    config.onClosed();
            };

            var scaleImage = function () {
                var zoomFactor = zoomControl.GetZoomFactor();
                var ow = parseInt($("#scrollableImage").attr("origWidth"));
                var oh = parseInt($("#scrollableImage").attr("origHeight"));
                var w = Math.round(ow * zoomFactor);
                var h = Math.round(oh * zoomFactor);
                $("#scrollableImage").width(w).height(h);
                if (config.zoomChanged)
                    config.zoomChanged(zoomControl.GetZoomFactor());

                var img = $("#scrollableImage");
                var scrollArea = $("#modalImageScroller");

                var viewWidth = scrollArea.width();
                var viewHeight = scrollArea.height();

                modal.topLeft.X = MarsRover.Util.Clamp(modal.topLeft.X, 0, w - viewWidth);
                modal.topLeft.Y = MarsRover.Util.Clamp(modal.topLeft.Y, 0, h - viewHeight);

                var parentLeft = scrollArea.offset().left;
                var parentTop = scrollArea.offset().top;

                img.offset({ top: parentTop - modal.topLeft.Y, left: parentLeft - modal.topLeft.X });
            };

            var zoomIn = function (e) {
                zoomControl.ZoomIn();
                scaleImage();
            };
            var zoomOut = function (e) {
                zoomControl.ZoomOut();
                scaleImage();
            };

            $("#closeButton").click(okFunction);
            ModalDialog.AddKeyboard(okFunction, okFunction, zoomIn, zoomOut);

            ModalDialog.mousedown = function (e) {
                modal.OnMouseDown(e);
            };
            ModalDialog.mousemove = function (e) {
                modal.OnMouseMove(e, config.onScroll);
            };
            ModalDialog.mouseup = function (e) {
                modal.OnMouseUp(e);
            };

            $("#modalImageScroller").mousedown(ModalDialog.mousedown);
            if ($("#modalImageScroller")[0].releaseCapture)
                $("#modalImageScroller").mousemove(ModalDialog.mousemove);
            else
                $(window).mousemove(ModalDialog.mousemove);

            $(window).mouseup(ModalDialog.mouseup);

            var imgLoaded = false;
            var onImageLoad = function () {
                if (imgLoaded)
                    return;
                imgLoaded = true;
                var w = $("#scrollableImage").width();
                var h = $("#scrollableImage").height();

                if (!config.dontUpdateOrigDimensions) {
                    $("#scrollableImage").attr({ "origWidth": w, "origHeight": h });
                }
                var zoomToWidth = $("#modalImageScroller").width() / w;
                var zoomToHeight = $("#modalImageScroller").height() / h;

                var minZoom = Math.min(zoomToHeight, zoomToWidth);
                zoomControl.SetMinZoom(minZoom);
                zoomControl.SetZoomFactor(minZoom);
                scaleImage();
            };

            if ($("#scrollableImage")[0].complete) {
                onImageLoad();
            }

            $("#scrollableImage").load(onImageLoad);
        };

        ModalDialog.prototype.OnMouseDown = function (e) {
            var ele = e.target;
            if ((ele.className === "zoomIn" || ele.className === "zoomOut") && ele.tagName.toUpperCase() === "IMG") {
                return;
            }
            var img = $("#scrollableImage")[0];
            this.dragging = true;
            if (img.setCapture)
                img.setCapture();
            this.startOffset = new Drawing.Point(this.topLeft.X, this.topLeft.Y);
            this.anchor = new Drawing.Point(e.pageX, e.pageY);
            e.preventDefault();
            return false;
        };

        ModalDialog.prototype.OnMouseMove = function (e, onScroll) {
            var img = $("#scrollableImage");
            var scrollArea = $("#modalImageScroller");
            if (!this.dragging)
                return;

            var viewWidth = scrollArea.width();
            var viewHeight = scrollArea.height();

            var delta = { x: e.pageX - this.anchor.X, y: e.pageY - this.anchor.Y };
            var newX = this.startOffset.X - delta.x;
            var newY = this.startOffset.Y - delta.y;
            this.topLeft.X = MarsRover.Util.Clamp(newX, 0, img.width() - viewWidth);
            this.topLeft.Y = MarsRover.Util.Clamp(newY, 0, img.height() - viewHeight);

            var parentLeft = scrollArea.offset().left;
            var parentTop = scrollArea.offset().top;

            img.offset({ top: parentTop - this.topLeft.Y, left: parentLeft - this.topLeft.X });

            if (onScroll)
                onScroll();
        };

        ModalDialog.prototype.OnMouseUp = function (e) {
            var img = $("#modalImageScroller")[0];
            if (img.releaseCapture)
                img.releaseCapture();
            this.dragging = false;
        };

        ModalDialog.Hide = function () {
            $("#modal").remove();
            if (ModalDialog.keydown) {
                $(window).unbind("keydown", ModalDialog.keydown);
                ModalDialog.keydown = null;
            }
            if (ModalDialog.mousemove) {
                $(window).unbind("mousemove", ModalDialog.mousemove);
                ModalDialog.keydown = null;
            }
            if (ModalDialog.mouseup) {
                $(window).unbind("mouseup", ModalDialog.mouseup);
                ModalDialog.keydown = null;
            }
            ModalDialog.mousedown = null;
        };

        ModalDialog.AddKeyboard = function (okFunction, cancelFunction, zoomIn, zoomOut) {
            if (typeof cancelFunction === "undefined") { cancelFunction = null; }
            if (typeof zoomIn === "undefined") { zoomIn = null; }
            if (typeof zoomOut === "undefined") { zoomOut = null; }
            if (ModalDialog.keydown) {
                $(window).unbind("keydown", ModalDialog.keydown);
            }
            ModalDialog.keydown = function (e) {
                if (e.keyCode == 13) {
                    okFunction();
                } else if (cancelFunction && e.keyCode == 27) {
                    cancelFunction();
                } else if (zoomOut && ModalDialog.CheckKey(e.keyCode, 109, 189)) {
                    zoomOut();
                } else if (zoomIn && ModalDialog.CheckKey(e.keyCode, 187, 107)) {
                    zoomIn();
                }
            };
            $(window).keydown(ModalDialog.keydown);
        };

        ModalDialog.CheckKey = function (keyCode) {
            var codes = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                codes[_i] = arguments[_i + 1];
            }
            for (var i = 0; i < codes.length; i++) {
                if (keyCode === codes[i])
                    return true;
            }
            return false;
        };

        ModalDialog.ShowAddToQueueDialog = function (observation, add, cancel) {
            if (typeof cancel === "undefined") { cancel = null; }
            var timeDisplay = [];
            timeDisplay.push('<div class="instrument">');
            timeDisplay.push('<img src="' + MarsRover.GameController.GetImagePath(observation.observation) + '" / > <br / >');
            for (var i = 0; i < 10; i++) {
                if (i < observation.Duration)
                    timeDisplay.push('<div class="timeUnit on"></div>');
                else
                    timeDisplay.push('<div class="timeUnit"></div>');
            }
            timeDisplay.push('</div>');

            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + timeDisplay.join('') + '<h1>' + observation.footprint.Name + '</h1>' + '<h3>' + observation.observation.Name + '</h3>' + '<div id="modalTextbox"><p>' + observation.footprint.Description + "</p><p>" + observation.observation.Introduction + '</p></div>' + '<div id="cancelButton" class="button">' + '<img src="images/textCancel.png" />' + '</div>' + '<div id="queueButton" class="button">' + '<img src="images/textAddToQueue.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var okFunction = function (e) {
                ModalDialog.Hide();
                add(observation);
            };

            var cancelFunction = function (e) {
                ModalDialog.Hide();
                if (cancel)
                    cancel();
            };

            $("#queueButton").click(okFunction);
            $("#cancelButton").click(cancelFunction);
            ModalDialog.AddKeyboard(okFunction, cancelFunction);

            $("#modalTextbox").enableSelection();
        };

        ModalDialog.ShowRemoveFromQueueDialog = function (observation, remove, cancel) {
            if (typeof cancel === "undefined") { cancel = null; }
            var timeDisplay = [];
            timeDisplay.push('<div class="instrument">');
            timeDisplay.push('<img src="' + MarsRover.GameController.GetImagePath(observation.observation) + '" / > <br / >');
            for (var i = 0; i < 10; i++) {
                if (i < observation.Duration)
                    timeDisplay.push('<div class="timeUnit on"></div>');
                else
                    timeDisplay.push('<div class="timeUnit"></div>');
            }
            timeDisplay.push('</div>');

            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + timeDisplay.join('') + '<h1>' + observation.footprint.Name + '</h1>' + '<h3>' + observation.observation.Name + '</h3>' + '<div id="modalTextbox"><p>' + observation.footprint.Description + "</p><p>" + observation.observation.Introduction + '</p></div>' + '<div id="cancelButton" class="button">' + '<img src="images/textCancel.png" />' + '</div>' + '<div id="queueButton" class="button">' + '<img src="images/textRemoveFromQueue.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var okFunction = function (e) {
                ModalDialog.Hide();
                remove(observation);
            };

            var cancelFunction = function (e) {
                ModalDialog.Hide();
                if (cancel)
                    cancel();
            };

            $("#queueButton").click(okFunction);
            $("#cancelButton").click(cancelFunction);
            ModalDialog.AddKeyboard(okFunction, cancelFunction);

            $("#modalTextbox").enableSelection();
        };

        ModalDialog.ShowGameOverDialog = function (currentSolNumber, exportToFile) {
            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + '<h1>Game Over!</h1>' + '<h3>The engineering team was not able to uplink your last plan and is unable to contact the rover. The mission has ended after ' + currentSolNumber + ' sols on the surface of Mars.</h3>' + '<div id="modalTextbox" style="overflow:none;"><textarea id="summaryBox"></textarea></div>' + '<div id="queueButton" class="button">' + '<img src="images/textDownloadDataReview.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var h3 = $("#modalInner").find("h3");
            var top = h3.offset().top + h3.height() - $("#modalInner").offset().top;
            $("#modalTextbox").css("top", top + 5);

            $("#queueButton").click(function (e) {
                var summary = $("#summaryBox").val();

                ModalDialog.Hide();
                exportToFile(summary);
            });

            setTimeout(function () {
                $("#summaryBox").focus();
            }, 10);
        };

        ModalDialog.ShowTravelDialog = function (destinationSiteName, sols, introduction, onTravel) {
            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + '<h1> Travel to ' + destinationSiteName + '</h1>' + '<h3> This will take ' + sols + ' sols.</h3>' + '<div id="cancelButton" class="button">' + '<img src="images/textCancel.png" />' + '</div>' + '<div id="queueButton"  class="button">' + '<img src="images/textTravel.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var cancelFunction = function (e) {
                ModalDialog.Hide();
            };

            var okFunction = function (e) {
                ModalDialog.Hide();
                onTravel();
            };

            $("#cancelButton").click(cancelFunction);
            $("#queueButton").click(okFunction);
            ModalDialog.AddKeyboard(okFunction, cancelFunction);

            ModalDialog.Center();
        };

        ModalDialog.Alert = function (message, onOk) {
            if (typeof onOk === "undefined") { onOk = null; }
            var html = '<div id="modal" class="dialogBox">' + '<div id="modalInner">' + '<h1> ' + message + '</h1>' + '<div id="queueButton" class="button">' + '<img src="images/textClose.png" />' + '</div>' + '</div>' + '</div>';

            $(document.body).append(html);

            var okFunction = function (e) {
                ModalDialog.Hide();
                if (onOk)
                    onOk();
            };

            $("#queueButton").click(okFunction);
            ModalDialog.AddKeyboard(okFunction, okFunction);

            ModalDialog.Center();
        };
        return ModalDialog;
    })();
    MarsRover.ModalDialog = ModalDialog;
})(MarsRover || (MarsRover = {}));
///<reference path="../typings/raphael/raphael.d.ts" />
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="Point.ts" />
///<reference path="DrawingCanvas.ts" />
///<reference path="DrawingObject.ts" />
var Drawing;
(function (Drawing) {
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line() {
            _super.call(this);
            this.Points = [];
            this.Offset = new Drawing.Point(0, 0);
        }
        Line.prototype.GetElement = function () {
            return this.Path.node;
        };

        Line.prototype.SetStrokeColor = function (strokeColor) {
            this.StrokeColor = strokeColor;
            if (this.Path)
                this.Path.attr("stroke", this.StrokeColor);
        };

        Line.prototype.SetStrokeThickness = function (thickness) {
            this.StrokeThickness = thickness;
        };

        Line.prototype.SetZIndex = function (z) {
            this.Z = z;
        };

        /** 0-1 */
        Line.prototype.SetOpacity = function (opacity) {
            this.Opacity = opacity;
        };

        /** The Polygon is translated by offset */
        Line.prototype.SetOffset = function (offset) {
            this.Offset = offset;
            var t = 't';
            this.Path.attr({ transform: [t, -this.Offset.X, -this.Offset.Y] });
        };

        Line.prototype.DrawToSVG = function (paper) {
            this.paper = paper;
            var pathString = "M ";
            pathString += Math.round(this.Points[0].X) + ", " + Math.round(this.Points[0].Y);
            pathString += " L ";
            pathString += Math.round(this.Points[1].X) + ", " + Math.round(this.Points[1].Y);

            this.Path = paper.path(pathString);
            this.Path.attr("stroke", this.StrokeColor);
            this.Path.attr("fill-opacity", this.Opacity);
            var t = 't';
            this.Path.attr({ transform: [t, this.Offset.X, this.Offset.Y] });
            if (this.ToolTip)
                $(this.Path.node).attr({ "data-title": this.ToolTip });
        };

        Line.prototype.SetClass = function (className) {
            this.Path.node.className.baseVal = className;
        };

        Line.prototype.SetPoints = function (A, B) {
            this.Points = [A, B];
        };

        Line.prototype.Remove = function () {
            if (this.Path)
                $(this.GetElement()).remove();
        };
        return Line;
    })(Drawing.DrawingObject);
    Drawing.Line = Line;
})(Drawing || (Drawing = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="GameData.ts"/>
///<reference path="SiteList.ts"/>
///<reference path="SiteDetails.ts"/>
///<reference path="ToolTip.ts" />
///<reference path="Util.ts" />
///<reference path="Drawing/DrawingObject.ts" />
///<reference path="Drawing/SVGArea.ts" />
///<reference path="Drawing/Line.ts" />
var MarsRover;
(function (MarsRover) {
    var Minimap = (function () {
        function Minimap(gameData) {
            this.SiteClicked = new MarsRover.TypedEvent();
            this.ViewPositionChanged = new MarsRover.TypedEvent();
            this.gameData = gameData;
            var t = this;

            var mmSource = 'Sites/' + gameData.siteList.MinimapName;

            $("#miniNavMap").append('<img id="minimapImage" src="' + mmSource + '" />');

            $("#miniNavMap").mousedown(function (e) {
                MarsRover.ModalDialog.ShowScrollableImageDialog({
                    'name': 'Minimap', 'description': '', 'imgSrc': mmSource,
                    'onClosed': null,
                    'zoomChanged': function (zoomFactor) {
                        t.RefreshPoints(mapDiv, 0, true);
                    },
                    'onScroll': function () {
                        t.RefreshPoints(mapDiv, 0, true);
                    }
                });

                var mapImage = $("#scrollableImage");
                var mapDiv = mapImage.parent();

                t.RefreshPoints(mapDiv, 0, true);

                //$("#expandedMinimap").mousedown(function (e)
                //{
                //    e.preventDefault();
                //    return false;
                //});
                var minimapContextMenu = [
                    { 'Download image': function (menuItem, menu) {
                            t.SaveMinimapImage();
                        } }
                ];
                mapDiv.contextMenu(minimapContextMenu, { theme: 'vista' });

                e.preventDefault();
                return false;
            });

            this.RefreshPoints();
        }
        Minimap.prototype.SaveMinimapImage = function () {
            var mmSource = 'Sites/' + this.gameData.siteList.MinimapName;
            MarsRover.Util.DownloadFile(mmSource, this.gameData.siteList.MinimapName);
        };

        Minimap.prototype.Refresh = function () {
            this.RefreshPoints();
        };

        Minimap.prototype.RefreshPoints = function (mapHolder, offset, isDialog) {
            if (typeof mapHolder === "undefined") { mapHolder = null; }
            if (typeof offset === "undefined") { offset = 0; }
            if (typeof isDialog === "undefined") { isDialog = false; }
            mapHolder = mapHolder || $("#miniNavMap");
            mapHolder.find("img.pointImage").remove();
            var oldSvg = mapHolder.find("svg");
            oldSvg.remove();
            this.svgArea = new Drawing.SVGArea((mapHolder[0]));
            var t = this;
            var mmImage = mapHolder.find("img");
            var imgWidth = mmImage.width();
            var imgHeight = mmImage.height();
            var currentSiteName = t.gameData.GetCurrentSite().SiteName;
            var svg = mapHolder.find("svg");
            var w = mapHolder.width();
            var h = mapHolder.height();
            if (w == 0 && oldSvg.length == 1) {
                w = oldSvg.width();
                h = oldSvg.height();
            }
            if (w != 0)
                svg.width(w).css("width", w);
            if (h != 0)
                svg.height(h).css("height", h);

            var imgOffset = mmImage.position();

            for (var siteName in t.gameData.siteList.MinimapLocations) {
                var pt = t.gameData.siteList.MinimapLocations[siteName];
                var scaledPoint = t.ScalePoint(pt, imgWidth, imgHeight, imgOffset);
                var imgSource = currentSiteName == siteName ? "siteIconSelected.png" : "siteIcon.png";
                mapHolder.append('<img class="pointImage" style="position:absolute;z-index:20;top:' + scaledPoint.Y + 'px;left:' + scaledPoint.X + 'px" src="images/' + imgSource + '" />');
                t.AddEvents(siteName, mapHolder.find("img:last"), isDialog);
            }

            this.DrawViewportRect();

            // lines are drawn to center of points, so offset = 10
            imgOffset.left += 10;
            imgOffset.top += 10;

            for (var i = 0; i < t.gameData.siteList.TravelConnections.length; i++) {
                var tc = t.gameData.siteList.TravelConnections[i];
                var siteA = tc.SiteNames[0];
                var siteB = tc.SiteNames[1];
                var A = t.gameData.siteList.MinimapLocations[siteA];
                var B = t.gameData.siteList.MinimapLocations[siteB];
                var scaledA = t.ScalePoint(A, imgWidth, imgHeight, imgOffset);
                var scaledB = t.ScalePoint(B, imgWidth, imgHeight, imgOffset);
                var line = new Drawing.Line();
                line.SetPoints(scaledA, scaledB);
                line.SetStrokeColor("#00ff00");
                line.SetStrokeThickness(1);
                this.svgArea.AddChild(line);
            }
        };

        Minimap.prototype.ScalePoint = function (pt, imgWidth, imgHeight, offset) {
            var scaledX = Math.round(pt.X / this.gameData.siteList.MinimapWidth * imgWidth - 10 + offset.left);
            var scaledY = Math.round(pt.Y / this.gameData.siteList.MinimapHeight * imgHeight - 10 + offset.top);
            return new Drawing.Point(scaledX, scaledY);
        };

        Minimap.prototype.AddEvents = function (siteName, j, isDialog) {
            var t = this;
            j.mousedown(function (e) {
                var tc = t.gameData.siteList.GetTravelConnection(t.gameData.GetCurrentSite().SiteName, siteName);
                if (!tc) {
                    var msg = "You cannot travel to " + siteName + " at this time.";
                    if (isDialog)
                        alert(msg);
                    else
                        MarsRover.ModalDialog.Alert(msg);
                    e.preventDefault();
                    return false;
                }

                MarsRover.ModalDialog.Hide();
                MarsRover.ToolTip.Hide();

                MarsRover.ModalDialog.ShowTravelDialog(siteName, tc.Sols, t.gameData.siteList.GetSite(siteName).Introduction, function () {
                    t.SiteClicked.trigger(siteName);
                    t.RefreshPoints();
                });

                e.preventDefault();
                return false;
            });
            MarsRover.ToolTip.SetToolTip(j, siteName);
        };

        Minimap.prototype.SetCameraPosition = function (position) {
            this.viewportPosition = position;
            this.DrawViewportRect();
        };

        Minimap.prototype.DrawViewportRect = function () {
            var _this = this;
            if (!this.viewportPosition)
                return;
            var viewportRectangle = $("#viewOutline");
            if (viewportRectangle.length === 0) {
                viewportRectangle = $("<div>", { id: "viewOutline", class: "viewOutline" });
                viewportRectangle.mousedown(function (evt) {
                    return _this.OnViewportMouseDown(evt);
                });
                $(window).mousemove(function (e) {
                    return _this.OnViewportMouseMove(e);
                });
                $(window).mouseup(function (e) {
                    return _this.OnViewportMouseUp(e);
                });
            }

            var mapId = this.GetCurrentMapId();
            var mapWidth = $(mapId).width();
            var mapHeight = $(mapId).height();
            if (mapWidth === 0)
                return;

            var top = Math.round(this.viewportPosition.Top * mapHeight);
            var left = Math.round(this.viewportPosition.Left * mapWidth);
            var width = Math.min(mapWidth, Math.round(this.viewportPosition.Width * mapWidth));
            var height = Math.min(mapHeight, Math.round(this.viewportPosition.Height * mapHeight));

            viewportRectangle.css({ "top": top, "left": left }).width(width).height(height);

            $(mapId).append(viewportRectangle);
        };

        Minimap.prototype.GetCurrentMapId = function () {
            var onNavCam = this.gameData.IsOnNavCam();
            var onFrontHazCam = this.gameData.IsOnFrontHazCam();

            var mapId = "";
            if (onNavCam)
                mapId = "#miniViewMap";
            else if (onFrontHazCam)
                mapId = "#miniFrontHazCam";
            else
                mapId = "#miniRearHazCam";
            return mapId;
        };

        Minimap.prototype.OnViewportMouseDown = function (e) {
            this.dragging = true;
            MarsRover.ToolTip.Hide();
            var topLeft = this.GetViewportTopLeft();
            this.startOffset = new Drawing.Point(topLeft.X, topLeft.Y);
            this.anchor = new Drawing.Point(e.pageX, e.pageY);
            e.preventDefault();
            return false;
        };

        Minimap.prototype.OnViewportMouseMove = function (e) {
            if (!this.dragging)
                return;

            var mapId = this.GetCurrentMapId();
            var mapWidth = $(mapId).width();
            var mapHeight = $(mapId).height();

            var delta = { x: e.pageX - this.anchor.X, y: e.pageY - this.anchor.Y };
            var newX = this.startOffset.X + delta.x;
            var newY = this.startOffset.Y + delta.y;
            this.SetViewportRectTopLeft(newX, newY);
            this.CheckViewportBounds();
            this.ViewPositionChanged.trigger(newX / mapWidth, newY / mapHeight);
        };

        Minimap.prototype.CheckViewportBounds = function () {
            var mapId = this.GetCurrentMapId();
            var mapWidth = $(mapId).width();
            var mapHeight = $(mapId).height();

            var topLeft = this.GetViewportTopLeft();
            var newX = MarsRover.Util.Clamp(topLeft.X, 0, mapWidth - $("#viewOutline").width());
            var newY = MarsRover.Util.Clamp(topLeft.Y, 0, mapHeight - $("#viewOutline").height());
            this.SetViewportRectTopLeft(newX, newY);
        };

        Minimap.prototype.GetViewportTopLeft = function () {
            var viewportRectangle = $("#viewOutline");
            return new Drawing.Point(parseFloat(viewportRectangle.css('left')), parseFloat(viewportRectangle.css('top')));
        };

        Minimap.prototype.SetViewportRectTopLeft = function (x, y) {
            var viewportRectangle = $("#viewOutline");
            viewportRectangle.css({ "left": x, "top": y });
        };

        Minimap.prototype.OnViewportMouseUp = function (e) {
            this.dragging = false;
        };

        Minimap.prototype.SetData = function (siteDetails) {
            this.Refresh();
            var navCamName = "Navcam";
            if (siteDetails.NavCamImage && siteDetails.NavCamImage.CameraDisplayName) {
                navCamName = siteDetails.NavCamImage.CameraDisplayName;
            }
            $("#miniViewMap div.miniLabel").html(navCamName);
            $("#miniViewMap img").remove();
            $("#miniFrontHazCam img").remove();
            $("#miniRearHazCam img").remove();

            if (siteDetails.NavCamImage)
                $("#miniViewMap").show().append('<img src="' + siteDetails.NavCamImage.GetThumbPath() + '" />');
            else {
                $("#miniViewMap").hide();
            }
            if (siteDetails.FrontHazCamImage)
                $("#miniFrontHazCam").append('<img src="' + siteDetails.FrontHazCamImage.GetThumbPath() + '" />');
            else
                this.AddGreyImage("#miniFrontHazCam");
            if (siteDetails.RearHazCamImage)
                $("#miniRearHazCam").append('<img src="' + siteDetails.RearHazCamImage.GetThumbPath() + '" />');
            else
                this.AddGreyImage("#miniRearHazCam");

            this.FitNavCamImage();
        };

        Minimap.prototype.FitNavCamImage = function () {
            var $img = $("#miniViewMap img");
            var navCamSrc = '';
            var getNavCamSize = function (src, f) {
                return MarsRover.Util.GetImageSize(src, f);
            };

            if ($img.length === 0)
                getNavCamSize = function (src, f) {
                    return f(new MarsRover.Size(0, 0));
                };
            else
                navCamSrc = $img[0].src;

            var frontHazCamSrc = $("#miniFrontHazCam img")[0].src;
            var rearHazCamSrc = $("#miniRearHazCam img")[0].src;
            var t = this;
            var navCamTop = 175;

            MarsRover.Util.GetImageSize(frontHazCamSrc, function (frontHazCamSize) {
                MarsRover.Util.GetImageSize(rearHazCamSrc, function (rearHazCamSize) {
                    getNavCamSize(navCamSrc, function (navCamSize) {
                        var availableWidth = 288;
                        var availableHeight = 72;

                        var adjustedSize = navCamSize;
                        if (navCamSize.Height > 0)
                            adjustedSize = MarsRover.Util.FitToDimensions(navCamSize.Width, navCamSize.Height, availableWidth, availableHeight);

                        var h = adjustedSize.Height;
                        $("#miniViewMap").height(h);
                        var top = navCamTop + h + 9;
                        if (navCamSize.Height === 0)
                            top = navCamTop;

                        var maxHazCamHeight = Math.max(frontHazCamSize.Height, rearHazCamSize.Height);

                        $("#miniFrontHazCam").css({ 'left': 5, 'top': top }).height(maxHazCamHeight);
                        $("#miniRearHazCam").css({ 'left': 153, 'top': top }).height(maxHazCamHeight);
                        $("#mapHolder").height(top + 9 + maxHazCamHeight);
                        t.DrawViewportRect();
                    });
                });
            });
        };

        Minimap.prototype.AddGreyImage = function (imgHolder) {
            var ih = $(imgHolder);
            var w = ih.width();
            var h = ih.height();
            ih.append('<img src="images/grey.png" width="' + w + '" height="' + h + '" />');
        };
        return Minimap;
    })();
    MarsRover.Minimap = Minimap;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/linq/linq.d.ts" />
///<reference path="SiteDetails.ts" />
///<reference path="SiteList.ts" />
///<reference path="Viewport.ts" />
///<reference path="ToolTip.ts" />
///<reference path="ModalDialog.ts" />
///<reference path="Minimap.ts" />
var MarsRover;
(function (MarsRover) {
    var GameController = (function () {
        function GameController() {
            var _this = this;
            this.instrumentObservationMap = {};
            this.imageArea = $('#imageArea');
            this.treeControlPane = $('#treeControlPane');
            this.dataReviewPane = $('#dataReviewPane');
            this.dataReviewTab = $('#dataReviewTab');
            this.mainContent = $('#mainContent');
            this.SwitchToCamera();
            var t = this;

            $("#cameraTabButton").mousedown(function () {
                t.SwitchToCamera();
            });
            $("#dataReviewTabButton").mousedown(function () {
                t.SwitchToDataReview();
            });
            $("#goButton").mousedown(function () {
                t.Uplink();
            });
            $("#menuButton").mousedown(function () {
                return t.OpenMenu();
            });

            this.imageArea.disableSelection();

            $("#miniNavMap").disableSelection();
            $("#miniViewMap").disableSelection().click(function () {
                t.viewport.SetNavCam();
            });
            $("#miniFrontHazCam").disableSelection().click(function () {
                t.viewport.SetFrontHazCam();
            });
            $("#miniRearHazCam").disableSelection().click(function () {
                t.viewport.SetRearHazCam();
            });
            $("body").disableSelection();
            $("#toolPaletteBody img").disableSelection().disableDrag();
            $("#toolPaletteBody div").disableSelection();
            $("#toolPaletteBody").disableSelection();
            $("#toolPaletteTop").disableSelection();
            $("#toolPaletteBottom img").disableSelection().disableDrag();

            $("#toolPaletteBody > div").mouseenter(function (e) {
                t.MouseEnterInstrument(e);
            }).mouseleave(function (e) {
                t.MouseLeaveInstrument(e);
            });

            $("#queuePaletteLeft").disableDrag().disableSelection();
            $("#queuePaletteFarRight img").disableDrag().disableSelection();

            $("#tabHolder").disableSelection();

            $(document).ajaxError(function (event, jqxhr, settings, exception) {
                alert("loading: " + settings.url + " ERROR: " + exception);
            });

            $(window).keydown(function (e) {
                if ($("#modal").length > 0)
                    return;
                if (t.OnDataReview() && e.keyCode == 68) {
                    t.Download();
                }
                if (e.keyCode == 83) {
                    t.gameData.SaveGame();
                }
                if (MarsRover.ModalDialog.CheckKey(e.keyCode, 109, 189)) {
                    t.viewport.ZoomOut();
                }
                if (MarsRover.ModalDialog.CheckKey(e.keyCode, 187, 107)) {
                    t.viewport.ZoomIn();
                }
            });

            this.gameData = new MarsRover.GameData();

            this.gameData.CurrentSiteChanged.add(function () {
                t.OnCurrentSiteChanged();
            });

            this.gameData.GameLoaded.add(function () {
                _this.OnCurrentSiteChanged();
            });

            this.gameData.Load(function () {
                t.AddDownloadContextMenu($("#imageArea"), function () {
                    return t.SaveCameraImage();
                });
                t.viewport = new MarsRover.Viewport("imageArea", t.gameData);
                t.viewport.SelectedFootprintChanged.add(function () {
                    t.UpdateTools();
                });
                t.viewport.ViewPositionChanged.add(function () {
                    t.UpdateMinimapPosition();
                });
                t.viewport.ZoomChanged.add(function () {
                    t.UpdateMinimapPosition();
                });

                t.minimap = new MarsRover.Minimap(t.gameData);
                t.minimap.ViewPositionChanged.add(function (xPercent, yPercent) {
                    return t.OnMinimapDrag(xPercent, yPercent);
                });
                t.minimap.SiteClicked.add(function (siteName) {
                    if (t.gameData.CurrentSol.GetDuration() > 0) {
                        MarsRover.ModalDialog.Alert("Cannot travel with observations present in queue!");
                        return;
                    }

                    t.gameData.TravelToSite(siteName);
                    t.UpdateQueue();
                    t.SwitchToDataReview();
                    t.SelectSol(t.gameData.CurrentSolNumber() - 1);
                    t.UpdateMinimapPosition();
                });

                t.gameData.LoadAutosave();
                t.OnCurrentSiteChanged();
                t.UpdateMinimapPosition();
                t.viewport.ZoomToScreenWidth();
            });

            $('#mapHolder').css({ "z-index": 15 });

            $('#mapToggle').click(function () {
                $('#mapHolder').toggle('fast', function () {
                    if ($('#mapHolder').is(":visible"))
                        $('#mapToggleText').attr("src", "images/textHideMap.png");
                    else
                        $('#mapToggleText').attr("src", "images/textShowMap.png");
                });
            });

            $("#apxsDiv").mousedown(function (e) {
                if ($("#apxsDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsAPXS();
                });
                t.AddObservation(obs);
            });

            $("#MBDiv").mousedown(function (e) {
                if ($("#MBDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsMB();
                });
                t.AddObservation(obs);
            });

            $("#MIDiv").mousedown(function (e) {
                if ($("#MIDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsMI();
                });
                t.AddObservation(obs);
            });

            $("#MiniTESDiv").mousedown(function (e) {
                if ($("#MiniTESDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsMiniTES();
                });
                t.AddObservation(obs);
            });

            $("#RATDiv").mousedown(function (e) {
                if ($("#RATDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsRAT();
                });
                t.AddObservation(obs);
            });

            $("#PancamDiv").mousedown(function (e) {
                if ($("#PancamDiv").hasClass("disabled"))
                    return;
                var obs = t.GetObservation(function (x) {
                    return x.IsPanCam();
                });
                t.AddObservation(obs);
            });
        }
        GameController.prototype.AddDownloadContextMenu = function ($obj, click) {
            var mainCameraContextMenu = [
                { 'Download image': function (menuItem, menu) {
                        click();
                    } }
            ];

            $obj.bind("contextmenu", function (event) {
                event.preventDefault();
            });

            $obj.contextMenu(mainCameraContextMenu, { theme: 'vista' });
        };

        GameController.prototype.SaveCameraImage = function () {
            var camera = this.gameData.GetCurrentCamera();
            var imageToDownload = camera.GetFullImagePath();
            MarsRover.Util.DownloadFile(imageToDownload, camera.ImageBaseName + camera.ImageExtension);
        };

        GameController.prototype.UpdateMinimapPosition = function () {
            if (!this.minimap)
                return;
            this.minimap.SetCameraPosition(this.viewport.GetViewportPosition());
        };

        GameController.prototype.OnMinimapDrag = function (xPercent, yPercent) {
            this.viewport.SetViewportPosition(xPercent, yPercent);
        };

        GameController.prototype.OnResize = function () {
            this.UpdateMinimapPosition();
        };

        GameController.prototype.OnCurrentSiteChanged = function () {
            this.minimap.SetData(this.gameData.GetCurrentSite());
            this.viewport.ClearSelection();
            this.viewport.RefreshScreen();
            this.viewport.ZoomToScreenWidth();
            this.UpdateTools();
            this.UpdateQueue();
            this.gameData.Autosave();
        };

        GameController.prototype.AddObservation = function (obs) {
            if (!obs)
                return;

            var oData = this.gameData.GetObservation(this.viewport.GetSelectedFootprint().GetFootprint(), obs);

            var t = this;

            MarsRover.ModalDialog.ShowAddToQueueDialog(oData, function (observationData) {
                var errorMessage = t.gameData.AddObservation(observationData);
                if (errorMessage && errorMessage != "") {
                    MarsRover.ModalDialog.Alert(errorMessage);
                    return;
                }

                t.UpdateQueue();
                t.UpdateTools();
                t.gameData.Autosave();
            });
        };

        GameController.prototype.RemoveObservation = function (obsName) {
            var obs = Enumerable.From(this.gameData.CurrentSol.Observations).FirstOrDefault(null, function (x) {
                return x.observation.Name == obsName;
            });
            var t = this;
            MarsRover.ModalDialog.ShowRemoveFromQueueDialog(obs, function (oData) {
                t.gameData.CurrentSol.Observations = Enumerable.From(t.gameData.CurrentSol.Observations).Where(function (x) {
                    return x != obs;
                }).ToArray();
                t.UpdateQueue();
                t.UpdateTools();
                t.gameData.Autosave();
            });
        };

        GameController.prototype.GetObservation = function (func) {
            var fp = this.viewport.GetSelectedFootprint();
            if (!fp)
                return null;
            var t = this;
            var obsList = Enumerable.From(fp.GetFootprint().Observations).Where(function (x) {
                return !t.gameData.HasTakenObservation(x.Name);
            });
            return obsList.FirstOrDefault(null, func);
        };

        GameController.prototype.OpenMenu = function () {
            var _this = this;
            MarsRover.ModalDialog.ShowMenuDialog(function () {
                return _this.Save();
            }, function (saveData) {
                return _this.Restore(saveData);
            }, function () {
                return _this.Restart();
            }, function () {
                return _this.Download();
            });
        };

        GameController.prototype.Save = function () {
            this.gameData.SaveGame();
        };

        GameController.prototype.Restore = function (saveData) {
            this.gameData.LoadGame(saveData);
            this.SwitchToCamera();
        };

        GameController.prototype.Restart = function () {
            this.gameData.StartOver();
            this.SwitchToCamera();
        };

        GameController.prototype.Download = function () {
            this.SaveStringAsFile("MissionManagerReport.html", this.GetDataReviewHtml(""));
        };

        GameController.prototype.Uplink = function () {
            if ($("#goButton").hasClass("disabled"))
                return;

            var t = this;

            //ModalDialog.ShowRunDialog(function (justification:string)
            //{
            t.gameData.MoveToNextSol("");
            if (t.gameData.GameDurationSols <= t.gameData.CurrentSolNumber() - 1) {
                t.IsGameOver = true;
                MarsRover.ModalDialog.ShowGameOverDialog(t.gameData.CurrentSolNumber() - 1, function (summary) {
                    t.SaveStringAsFile("MissionManagerReport.html", t.GetDataReviewHtml(summary));
                });
            }
            t.UpdateQueue();
            t.SwitchToDataReview();
            t.SelectSol(t.gameData.CurrentSolNumber() - 1);
            //});
        };

        GameController.prototype.GetDataReviewHtml = function (summary) {
            var baseUrl = document.location.toString().replace('default.htm', '');
            var html = [];
            html.push('<!DOCTYPE html><html xmlns = "http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" /><title>Mars EPO </title>');
            html.push('<link rel="stylesheet" href="' + baseUrl + 'styles.css" type="text/css" />');
            html.push('<link rel="stylesheet" href="' + baseUrl + 'treeControl.css" type="text/css" />');
            html.push('</head><body>');
            html.push('<div id="mainContent" style="left:0px;top:0px;bottom:0px;right:0px;">');
            html.push('<div class="dataReview">');
            html.push('<div id="dataReviewPane" style="left:0px">');
            var currentSol = this.gameData.CurrentSolNumber();
            for (var i = 1; i < currentSol; i++) {
                var sol = this.gameData.GetSol(i);
                if (sol.SkipDataReview)
                    continue;
                html.push('<div class="menuParent" style="background-image: url("' + baseUrl + 'css-ref/dataReviewSolGradientBG.png")">Sol ' + i + '</div>');
                html.push(this.GetHtmlForSol(sol, baseUrl));
            }
            html.push('<div class="menuParent" style="background-image: url("' + baseUrl + 'css-ref/dataReviewSolGradientBG.png")"> Game Over Summary: </div>');
            html.push('<div id="gameOverSummary">' + summary + "</div>");
            html.push('</div></div></div></body></html>');
            return html.join('\r\n');
        };

        GameController.prototype.UpdateQueue = function () {
            var queue = $("#actionQueue");
            queue.children().remove();
            var obsList = this.gameData.CurrentSol.Observations;
            var queueStr = [];
            for (var i in obsList) {
                var obsData = obsList[i];
                var obs = obsData.observation;
                var imagePath = GameController.GetImagePath(obs);
                var width = obsData.Duration * 10;
                var str = "<td width=\"" + width + "%\" class=\"filled\" data-obsName=\"" + obs.Name + "\" >" + "<img src=\"" + imagePath + "\" />" + "</td>";
                queueStr.push(str);
            }
            for (var x = this.gameData.CurrentSol.GetDuration(); x < 10; x++) {
                queueStr.push("<td width=\"10%\"></td>");
            }
            queue.append(queueStr.join(""));

            var t = this;

            $("#actionQueue > td").mousedown(function (e) {
                var obsName = $(e.currentTarget).attr("data-obsName");
                t.RemoveObservation(obsName);
            });

            if (obsList.length == 0 && !$("#goButton").hasClass("disabled"))
                $("#goButton").addClass("disabled");
            else
                $("#goButton").removeClass("disabled");
        };

        GameController.GetImagePath = function (obs) {
            if (obs.IsPanCam())
                return "images/textPancam.png";
            if (obs.IsMiniTES())
                return "images/textMiniTES.png";
            if (obs.IsAPXS())
                return "images/textAPXS.png";
            if (obs.IsMB())
                return "images/textMB.png";
            if (obs.IsMI())
                return "images/textMI.png";
            if (obs.IsRAT())
                return "images/textRAT.png";
        };

        GameController.prototype.OnDataReview = function () {
            return $("#dataReviewTabButton").hasClass("topTabSelected");
        };

        GameController.prototype.SwitchToDataReview = function () {
            if (this.gameData.SolsTaken.length == 0) {
                //ModalDialog.Alert("You don't have any data to review!");
                return;
            }
            $("#dataReviewTabButton").addClass("topTabSelected");
            $("#cameraTabButton").removeClass("topTabSelected");
            $('#mapToggle').hide();
            this.imageArea.hide();
            this.dataReviewTab.appendTo(this.mainContent);
            this.UpdateDataReview();
            this.UpdateTools();
            this.gameData.Autosave();
        };

        GameController.prototype.SwitchToCamera = function () {
            if (this.IsGameOver)
                return;

            $('#mapToggle').show();

            $("#cameraTabButton").addClass("topTabSelected");
            $("#dataReviewTabButton").removeClass("topTabSelected");
            this.imageArea.show();
            this.dataReviewTab.remove();
            this.treeControlPane.children().remove();
            $("#dataReviewContent").children().remove();
            this.UpdateTools();
            if (this.viewport)
                this.viewport.RefreshScreen();
            this.UpdateMinimapPosition();
        };

        GameController.prototype.UpdateDataReview = function () {
            var t = this;
            this.treeControlPane.children().remove();
            var solsTaken = this.gameData.SolsTaken;
            var treeStr = [];
            for (var i = 0; i < solsTaken.length; i++) {
                var sol = solsTaken[i];
                if (sol.SkipDataReview)
                    continue;
                treeStr.push('<div class="menuParent" data-sol="' + sol.SolNumber + '"> Sol ' + sol.SolNumber + '</div>');
            }
            this.treeControlPane.append(treeStr.join(''));
            this.treeControlPane.find("div.menuParent").mousedown(function (e) {
                t.ToggleTreeNode(e);
            });

            this.SelectSol(this.gameData.CurrentSolNumber() - 1);
        };

        GameController.prototype.SaveStringAsFile = function (filename, content) {
            var data = [content];
            var oMyBlob = new Blob(data, { type: "text/plain;charset=utf-8" });
            var w = window;
            w.saveAs(oMyBlob, filename);
        };

        GameController.prototype.ToggleTreeNode = function (e) {
            var solNumber = parseInt($(e.currentTarget).attr("data-sol"));
            this.SelectSol(solNumber);
        };

        GameController.prototype.SelectSol = function (solNumber) {
            $("#dataReviewPane").children().remove();
            var t = this;
            var sol = this.gameData.GetSol(solNumber);

            var dataStr = t.GetHtmlForSol(sol);

            this.dataReviewPane.append(dataStr);

            var t = this;
            $("div.imageHolder").unbind("click").click(function (e) {
                var ele = $(e.currentTarget);
                var name = ele.parent().find("h3.observationName").text();
                var description = ele.parent().find("p.observationDescription").text();
                var imgSource = ele.find("img").attr("src");
                MarsRover.ModalDialog.ShowScrollableImageDialog({ 'name': name, 'description': description, 'imgSrc': imgSource });
                t.AddDownloadContextMenu($("#scrollableImage"), function () {
                    MarsRover.Util.DownloadFile($("#scrollableImage").attr("src"));
                });
            });
        };

        GameController.prototype.FormatAsHtml = function (s) {
            if (!s)
                return '';
            return s.replace("\r\n", "<br />");
        };

        GameController.prototype.GetHtmlForSol = function (sol, baseUrl) {
            if (typeof baseUrl === "undefined") { baseUrl = ""; }
            var t = this;
            var dataStr = [];

            if (sol.IsTraveling) {
                dataStr.push('<div class="justification"><strong>' + sol.TravelTime + ' sols were spent traveling to ' + sol.SiteName + '</strong> ');
                dataStr.push(t.FormatAsHtml(sol.SiteIntroduction) + '</div>');

                //dataStr.push('<div style="text-align:center;">');
                //var site = t.gameData.siteList.GetSite(sol.SiteName);
                //var camera = site.NavCamImage || site.FrontHazCamImage || site.RearHazCamImage;
                //dataStr.push('<img src="' + baseUrl + t.gameData.siteList.GetSite(sol.SiteName).ImageDirectory + '/' + camera.GetThumbPath() + '" />');
                //dataStr.push('</div>');
                return dataStr.join("");
            }

            var obsInSol = Enumerable.From(sol.Observations);

            var footprints = obsInSol.Select(function (x) {
                return x.footprint;
            }).Distinct();

            //dataStr.push('<div class="justification"><strong>The scientific justification for these activities was: </strong>' + sol.Justification + '</div>');
            footprints.ForEach(function (fp) {
                dataStr.push('<div class="footprint">');
                dataStr.push('<h2>' + fp.Name + '</h2>');
                dataStr.push('<div class="description">' + t.FormatAsHtml(fp.Description || "") + '</div>');

                obsInSol.ForEach(function (obs) {
                    var oData = obs;
                    if (oData.footprint != fp)
                        return;
                    dataStr.push('<div class="observation">');
                    dataStr.push('<div class="instrument">');
                    dataStr.push('<img src="' + baseUrl + GameController.GetImagePath(oData.observation) + '" / > <br / >');

                    for (var i = 0; i < 10; i++) {
                        if (i < oData.Duration)
                            dataStr.push('<div class="timeUnit on"></div>');
                        else
                            dataStr.push('<div class="timeUnit"></div>');
                    }

                    dataStr.push('</div>');

                    dataStr.push('<h3 class="observationName">' + oData.observation.Name + '</h3>');

                    dataStr.push('<div class="description">' + t.FormatAsHtml(oData.observation.Introduction) + '</div>');
                    dataStr.push('<div class="imageHolder">');
                    for (var idx in oData.observation.ImageNames) {
                        var imageName = oData.observation.ImageNames[idx];
                        dataStr.push('<img src="' + baseUrl + t.gameData.siteList.GetSite(sol.SiteName).ImageDirectory + '/Images/' + imageName + '" />');
                    }
                    dataStr.push('</div>');

                    dataStr.push('<p class="observationDescription">' + oData.observation.Description + '</p>');

                    dataStr.push('<div class="clear"></div>');
                    dataStr.push('</div>');
                    return true;
                });
                dataStr.push('</div>');
                return true;
            });

            return dataStr.join('');
        };

        GameController.prototype.UpdateTools = function () {
            if (!this.viewport)
                return;

            this.instrumentObservationMap = {};

            var onCameraTab = $("#cameraTabButton").hasClass("topTabSelected");

            var disabledClass = "disabled";
            var classList = {
                "apxsDiv": disabledClass, "MBDiv": disabledClass, "MIDiv": disabledClass,
                "MiniTESDiv": disabledClass, "RATDiv": disabledClass, "PancamDiv": disabledClass
            };
            var fp = this.viewport.GetSelectedFootprint();
            if (fp && onCameraTab && !this.IsGameOver) {
                var footprint = fp.GetFootprint();
                var obsList = footprint.Observations;

                for (var i in obsList) {
                    var obs = obsList[i];
                    if (!this.gameData.IsVisible(obs) || this.InCurrentSol(obs))
                        continue;
                    var oData = new MarsRover.ObservationData(footprint, obs);
                    var instrumentName = "";
                    if (obs.IsAPXS())
                        instrumentName = "apxsDiv";
                    else if (obs.IsRAT())
                        instrumentName = "RATDiv";
                    else if (obs.IsMB())
                        instrumentName = "MBDiv";
                    else if (obs.IsMI())
                        instrumentName = "MIDiv";
                    else if (obs.IsMiniTES())
                        instrumentName = "MiniTESDiv";
                    else if (obs.IsPanCam())
                        instrumentName = "PancamDiv";

                    classList[instrumentName] = "";
                    this.instrumentObservationMap[instrumentName] = oData;
                }
            }

            for (var id in classList) {
                var className = classList[id];

                $("#" + id).removeClass();
                if (className != "")
                    $("#" + id).addClass(className);
            }
        };

        GameController.prototype.InCurrentSol = function (observation) {
            return Enumerable.From(this.gameData.CurrentSol.Observations).Any(function (x) {
                return x.observation.Name == observation.Name;
            });
        };

        GameController.prototype.MouseEnterInstrument = function (e) {
            var node = e.currentTarget;
            var id = node.id;
            var obs = this.instrumentObservationMap[id];
            if (obs) {
                var toolTip = obs.footprint.Name + "<br />" + obs.observation.Introduction;
                MarsRover.ToolTip.Show(toolTip, e.pageX, e.pageY);
            }
        };

        GameController.prototype.MouseLeaveInstrument = function (e) {
            MarsRover.ToolTip.Hide();
        };
        return GameController;
    })();
    MarsRover.GameController = GameController;
})(MarsRover || (MarsRover = {}));
///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="SiteDetails.ts" />
///<reference path="SiteList.ts" />
///<reference path="Viewport.ts" />
///<reference path="GameController.ts" />
var MarsRover;
(function (MarsRover) {
    var gameController;

    $(function () {
        gameController = new MarsRover.GameController();
        $(window).resize(onResize);
    });

    function onResize() {
        var h = $("#imageArea").height();
        var w = $("#imageArea").width();

        var svg = $("#imageArea > svg");
        svg.width(w);
        svg.height(h);
        gameController.OnResize();
    }

    $.fn.extend({
        disableSelection: function () {
            return this.each(function () {
                //this.onselectstart = function () { return false; };
                //this.unselectable = "on";
                $(this).css('user-select', 'none').css('-o-user-select', 'none').css('-moz-user-select', 'none').css('-khtml-user-select', 'none').css('-webkit-user-select', 'none');
            });
        }
    });

    $.fn.extend({
        enableSelection: function () {
            return this.each(function () {
                this.onselectstart = null;
                this.unselectable = null;
                $(this).css('user-select', 'text').css('-o-user-select', 'text').css('-moz-user-select', 'text').css('-khtml-user-select', 'text').css('-webkit-user-select', 'text');
            });
        }
    });

    $.fn.extend({
        disableDrag: function () {
            return this.each(function () {
                this.onmousedown = function () {
                    return false;
                };
                this.ondragstart = function () {
                    return false;
                };
            });
        }
    });
})(MarsRover || (MarsRover = {}));
//# sourceMappingURL=MarsRover.js.map
