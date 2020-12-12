import React, { Component } from 'react';

export class Home extends Component {
    constructor(props) {
        super();
        this.state = {
            numDataSets: 4,
            data: [
                "0.1, 0.6, 2.2, 0.7, -2.0, 0.7, 0.0, -2.6, -1.4, 1.5, 2.8, 0.3, -1.0, -1.0",
                "-0.1, 0.2, 0.0, -0.4, -0.9, -1.1, 1.2, 0.1, 0.7, -2.0, -0.9, -3.0, 1.0, 1.2",
                "-1.6, -0.4, 0.4, -2.0, -3.4, -2.8, -2.2, -1.8, -3.3, -2.1, -3.6, -0.4, -3.1",
                "-3.1, -3.2, -2.0, -2.0, -3.3, -0.5, -4.5, -0.7, -1.8, -2.3, -1.3, -1.0, -5.6, -2.9, -1.6, -0.2"
            ],
            formattedData: [
            ],
            errors: [0, 0, 0, 0],
            testStatistic: 0,
            degreesOfFreedom: 0,
            k: null,
            grandMean: null,
            meanSquareOfError: null,
            meanSquareOfTreatments: null,
            sumSquareOfError: null,
            sumSquareOfTreatments: null,
            fStatistic: null,
            dof1: null,
            dof2: null,
            pValue: null,
            intervals: null
        }
        this.renderDataSets = this.renderDataSets.bind(this);
        this.returnAnovaResults = this.returnAnovaResults.bind(this);
        this.addDataSet = this.addDataSet.bind(this);
        this.removeDataSet = this.removeDataSet.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    renderDataSets() {
        var dataSetDOM = [];

        for (var i = 0; i < this.state.numDataSets; i++) {
            dataSetDOM.push(<DataSet index={i} errorStatus={this.state.errors[i]} initialValue={this.state.data[i]} key={i} dataToParent={this.updateData} />);
        }
        return dataSetDOM;
    }

    returnAnovaResults() {

        var fd = [...this.state.data];
        var currentErrors = this.state.errors;

        for (var i = 0; i < currentErrors.length; i++) {
            currentErrors[i] = 0;
        }

        //Each dataset's input
        for (var i = 0; i < fd.length; i++) {

            //Remove consecutive commas
            fd[i] = fd[i].replace(/,{2,}/gi, ',');

            //Check for trailing commas.
            if (fd[i].slice(-1) === ',') {
                fd[i] = fd[i].slice(0, -1);
            }


            fd[i] = fd[i].split(",");
            //Parse each set's input.
            for (var j = 0; j < fd[i].length; j++) {
                fd[i][j] = parseFloat(fd[i][j]);
                //console.log(fd[i]);
                if (Number.isNaN(fd[i][j])) {
                    currentErrors[i] = 1;
                }
            }
        }
        this.setState({ formattedData: fd, errors: currentErrors });

        for (var i = 0; i < currentErrors.length; i++) {
            if (currentErrors[i] == 1) {
                return;
            }
        }

        fetch("/Anova/Post",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fd)
            })
            .then((res) => { return res.json(); })
            .then((res => {
                console.log(res);

                this.setState({
                    grandMean: res.grandMean,
                    k: res.numDataSets,
                    sumSquareOfError: res.sumSquaredErrors,
                    sumSquareOfTreatments: res.sumOfSquaresForTreatment,
                    meanSquareOfError: res.meanSquareOfError,
                    meanSquareOfTreatments: res.meanSquareOftreatment,
                    dof1: res.degreesOfFreedomOne,
                    dof2: res.degreesOfFreedomTwo,
                    fStatistic: res.fStatistic,
                    pValue: res.pValue,
                    labels: res.labels,
                    intervals: res.tkIntervals
                });
            }));
    }

    addDataSet() {
        var nds = this.state.numDataSets + 1;
        var newData = this.state.data;
        newData.push("");
        this.setState({ numDataSets: nds, data: newData });
        console.log(this.state);
    }

    updateData(i, d) {
        var newData = this.state.data;
        var newErrors = this.state.errors;
        newErrors.push(0);
        newData[i] = d;
        this.setState({
            data: newData,
            errors: newErrors
        });
        console.log(this.state);
    }

    removeDataSet() {
        var nds = this.state.numDataSets - 1;
        var newData = this.state.data;
        var newErrors = this.state.errors;
        newData.pop();
        newErrors.pop();

        this.setState({ numDataSets: nds, data: newData, errors: newErrors });
    }

    render() {
        return (
            <div>
                <div className="row">
                    <Title />
                </div>
                <div className="row">
                    <div className="col-md-6 col-12">
                        {this.renderDataSets()}
                        <div className="control-panel">
                            <button className="quantity-change-button" onClick={this.removeDataSet}>-</button>
                            <button className="quantity-change-button" onClick={this.addDataSet}>+</button>
                            <button className="submit-button" onClick={this.returnAnovaResults}>Analyze</button>
                        </div>
                    </div>
                    <TukeyKramerVisualization dataSets={this.state.numDataSets} intervals={this.state.intervals} labels={this.state.labels}/>
                </div>

                <div className="output-area">
                    <div className="output-header">
                        <p>Output</p>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">DOF1: </p>
                            <p className="answer-value">{this.state.dof1}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">DOF2: </p>
                            <p className="answer-value">{this.state.dof2}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">F-Statistic: </p>
                            <p className="answer-value">{this.state.fStatistic}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">K: </p>
                            <p className="answer-value">{this.state.k}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">N: </p>
                            <p className="answer-value">{this.state.grandMean}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">SSTr: </p>
                            <p className="answer-value">{this.state.sumSquareOfTreatments}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">SSE: </p>
                            <p className="answer-value">{this.state.sumSquareOfError}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">MSE: </p>
                            <p className="answer-value">{this.state.meanSquareOfError}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">MSTr: </p>
                            <p className="answer-value">{this.state.meanSquareOfTreatments}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Title extends Component {
    render() {
        return (
            <div>
                <h1 className="title-text col-md-6 col-12">
                    React A.N.O.V.A.
            </h1>
            </div>
        );
    }
}



class TukeyKramerVisualization extends Component {

    constructor(props) {
        super(props);
        this.graph = React.createRef();
        this.drawTkIntervals = this.drawTkIntervals.bind(this);
        this.calculateLeftPosition = this.calculateLeftPosition.bind(this);
    }


    drawTkIntervals() {

        if (this.props.intervals == null || this.graph.current == null) {
            return <text key={-3} x="50%" y="50%" textAnchor="middle" fill="black">Click 'Analyze' to generate a Tukey-Kramer Diagram</text>;
        }

        var maxAndMin = this.calculateIntervalMaxAndMin(this.props.intervals);
        var max = maxAndMin.max;
        var min = maxAndMin.min;

        var normalizedIntervals = JSON.parse(JSON.stringify(this.props.intervals));
        var legend = [-3,-2,-1, 0, 1, 2, 3];
        var normalizedLegend = this.calculateNormalizedLegend(legend,min,max);
        for (var i = 0; i < normalizedIntervals.length; i++) {
            normalizedIntervals[i][0] = (normalizedIntervals[i][0] - min) / (max - min);
            normalizedIntervals[i][1] = (normalizedIntervals[i][1] - min) / (max - min);
        }

        console.log(normalizedIntervals);

        min = min.toPrecision(2);
        max = max.toPrecision(2);

        var content = [];
        var width = this.graph.current.width.baseVal.value;
        var height = this.graph.current.height.baseVal.value;

        var offset = 0;
        var scale = 1;

        for (var i = 0; i < normalizedLegend.length; i++) {
            content.push(<text key={-(i+1)} x={this.calculateLeftPosition(normalizedLegend[i],width,offset)} y={15}>{legend[i]}</text>);
        }

        for (var i = 0; i < this.props.intervals.length; i++) {
            var left = this.calculateLeftPosition(normalizedIntervals[i][0],width,offset);
            var top = 30 + i * 20;
            var intervalWidth = ((normalizedIntervals[i][1] - normalizedIntervals[i][0]) * width)*scale;
            var fill = (0 > this.props.intervals[i][0]) && (0 < this.props.intervals[i][1]) ? "dodgerblue" : "lightgray";
            content.push(<rect fill={fill} key={i} x={left} y={top} width={intervalWidth} height="15" />);
            content.push(
                <text textAnchor="middle" key={(i + 1) * 100} x={left + intervalWidth / 2} y={top + 13} fontSize={13} fill="white">
                    &nbsp;
                MU<tspan fontSize="9" fill="white">{this.props.labels[i][0]}</tspan>
                &nbsp;-&nbsp;
                MU<tspan fontSize="9" fill="white">{this.props.labels[i][1]}</tspan>
                </text>
            );
        }
        return content;
    }
    calculateIntervalMaxAndMin(intervals) {

        var min = 999999999;
        var max = -999999999;


        for (var i = 0; i < intervals.length; i++) {
            if (this.props.intervals[i][0] < min) {
                min = intervals[i][0];
            }
            if (intervals[i][1] < min) {
                min = intervals[i][1];
            }
            if (intervals[i][0] > max) {
                max = intervals[i][0];
            }
            if (intervals[i][1] > max) {
                max = intervals[i][1];
            }
        }
        return {max:max,min:min}
    }
    calculateLeftPosition(value,width,offset) {
        return value * width + offset * width;
    }
    calculateNormalizedLegend(values, min, max) {
        var normalizedValues = Array(values.length).fill();
        for (var i = 0; i < values.length; i++) {
            normalizedValues[i] = (values[i] - min) / (max - min);
        }
        return normalizedValues;
    }

    render() {
        return (
            <div className="col-md-6 col-12">
                <svg
                    ref={this.graph}
                    onClick={this.drawTkIntervals}
                >
                    {this.drawTkIntervals()}
                </svg>
            </div>
        )
    }
}

class DataSet extends Component {

    constructor(props) {
        super();
        this.state = { value: props.initialValue };
        this.updateValue = this.updateValue.bind(this);
    }

    updateValue({ target }) {
        this.setState({ value: target.value });
        this.props.dataToParent(this.props.index, target.value);
    }

    render() {
        return (
            <div>
                <input className={this.props.errorStatus != 1 ? "dataset-input" : "error-input"} value={this.state.value} placeholder="Enter data values here." type="text" onChange={this.updateValue}></input>
                <br />
            </div>
        );
    }
}
