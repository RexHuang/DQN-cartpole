const height = 300,
      width = 500,
      frameRate = 30

let action = 0
let env;
let loss;
var reply;
var current_interval_id;

let totalReward = 0
let numEpisodes = 0

let numActions = 2;
let stateSize = 4;

let model = Sequential({
    loss: MSE(),
    optimizer: SGD(.001)
})

model
    .add(Linear(stateSize, 40, false))
    .add(ReLU())
    .add(Linear(40, 40))
    .add(ReLU())
    .add(Linear(40, numActions, false))

let agent = DQN({
    model,
    numActions,
    finalEpsilon: .1,
    epsilonDecaySteps: 10000,
    gamma: .9
})

document.addEventListener('DOMContentLoaded', () => {
    let svgContainer = d3.select("#cartpole-drawing")
        .attr("height", height)
        .attr("width", width)
    env = new Cartpole.Cartpole(svgContainer, {dt: 0.03, forceMult: 5})
    env.reset();

    actOutStep();

    document.getElementById("reset-button").addEventListener("click", e => {
        env.reset()
    })
})

function actOutStep() {
        var {state, reward, done} = env.step(action);
        var observation=ndarray([state.x,state.theta,state.xdot,state.thetadot]);
        reply={observation:observation,reward:reward, done:done};
        env.render(1 / frameRate * 1000);
        go();
}

function learn() {
        if (reply.observation) {
            action = agent.step(reply.observation, reply.reward, reply.done)
            loss = agent.learn()
            if(reply.reward)totalReward += reply.reward
            if (totalReward>=200) {
                reply.done=true;
            }
            if(reply.done){
              numEpisodes++
              env.reset()
              document.getElementById("rewardP").innerHTML = "Reward: " + totalReward
              totalReward=0
            }
            document.getElementById("doneP").innerHTML = "Done: " + reply.done
            actOutStep();
        }
}

function go() {
  window.clearInterval(current_interval_id);
  current_interval_id = setInterval(learn, 0);
}

