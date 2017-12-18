import { reduce, last } from 'lodash';

const TIMEFRAME_STEP_SIZE = 10; // step time in ms

let interval = null;

export function startTask(taskData, callback) {
    clearInterval(interval);

    let timeFrameStep = 0;
    let rulesArray = [];

    taskData.animation.map(({ task, cycles }) => {
        const taskRules = taskData.task.find(({ name }) => name === task);

        for (let cycle = 0; cycle < cycles; cycle++) {
            rulesArray = [...rulesArray, ...taskRules.rules];
        }
    });

    let timeFrames = rulesArray.map(({ time }) => time);

    timeFrames = reduce(timeFrames, (result, value) => {
        const isArray = Array.isArray(result);
        return isArray ? [...result, last(result) + value] : [result, result + value];
    });

    let ruleTime = 0;
    let prevRuleFrameIndex = 0;
    interval = setInterval(() => {
        timeFrameStep += TIMEFRAME_STEP_SIZE;
        ruleTime += TIMEFRAME_STEP_SIZE;

        let ruleFrameIndex = timeFrames.findIndex(time => timeFrameStep <= time);

        if (prevRuleFrameIndex !== ruleFrameIndex) {
            prevRuleFrameIndex = ruleFrameIndex;
            ruleTime = 0;
        }

        if (ruleFrameIndex === -1) {
            timeFrameStep = 0;
            ruleFrameIndex = 0;
        }

        const rule = rulesArray[ruleFrameIndex];

        const stripesStrength = rule.stripes.map(([valueFrom, valueTo]) => {
            let ledValue = valueFrom;

            if (typeof valueTo !== 'undefined') {
                const ledStrengthCoefficient = ruleTime / rule.time;

                if (valueFrom < valueTo) {
                    ledValue = valueFrom + (valueTo - valueFrom) * ledStrengthCoefficient;
                } else if (valueFrom > valueTo) {
                    ledValue = valueFrom - (valueFrom - valueTo) * ledStrengthCoefficient;
                }
            }

            return Number.parseInt(ledValue);
        });

        callback(stripesStrength);
    }, TIMEFRAME_STEP_SIZE);
}

export function stopTask() {
    clearInterval(interval);
}
