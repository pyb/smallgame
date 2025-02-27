'use client'

import React from "react"
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
enableMapSet(); // immer setup call, to make Maps and Sets work

import styles from "css/game.module.css"
import Grid from "UI/Grid"
import * as Types from "game/gameTypes"
import * as Data from "game/gameData"
import * as Game from "game/game"
import {initialGameState} from "game/gameState"

const resource1:Types.Resource = {
    id:1,
    name:"Foo",
}

const tick:number = 50; // ms

const findElement = (name: string, type: Types.ItemType, gs:Types.GameState): Types.Element => {
    return {
        resource: (type == Types.ItemType.Resource) ? Data.resourceMap.get(name) : undefined,
        task: (type == Types.ItemType.Task) ? Data.tasksMap.get(name) : undefined,
        n: (type == Types.ItemType.Resource) ? gs.resources.get(name) : undefined,
        progress: Game.getProgress(name, type, gs),
    }
}

const GameMain = () => {
    const [GS, setGS] = useImmer<Types.GameState>(initialGameState);
    const [doProcessInterval, setDoProcessInterval] = React.useState<boolean>(false);
    const intervalId = React.useRef<number>(0);
    const lastUpdate = React.useRef<number>(Date.now());

    if (doProcessInterval) {
        setDoProcessInterval(false);
        const time:number = Date.now();
        const delta = time - lastUpdate.current; // in ms
        lastUpdate.current = time;
        const update:Types.GameStateUpdate = Game.gameLoop(delta);
        if (update)
            setGS(update);
    }

    React.useEffect(() => {
        intervalId.current = window.setInterval(() => setDoProcessInterval(true),
            tick);
        return () => {
            window.clearInterval(intervalId.current);
        };
    }, [setGS, setDoProcessInterval]);

    return (
        <div className={styles.game}>
            <div className={styles.gridResources}>
                <Grid section={1} clickCallback={(name:string) => setGS(Game.click(name, Types.ItemType.Resource))}
                      elements = {[
                          { resource: Data.resourceMap.get("Dollar"), n: GS.resources.get("Dollar"), progress: 0 },
                          findElement("House", Types.ItemType.Resource, GS),
                          findElement("Cow", Types.ItemType.Resource, GS),
                          {},
                          {},
                          {},
                          {},
                        {},
                        {}
                      ]}>
                </Grid>
            </div>
            <div className={styles.gridTasks}>
                <Grid section={2}
                      clickCallback={(name:string) => setGS(Game.click(name, Types.ItemType.Task))}
                      elements = {[
                        {task: Data.tasksMap.get("Job"),
                            progress:Game.getProgress("Job", Types.ItemType.Task, GS)},
                        {},
                        {},
                        {},
                        {},
                        {},
                      ]}>
                </Grid>
            </div> 
        </div>
    );
}

export default GameMain;
