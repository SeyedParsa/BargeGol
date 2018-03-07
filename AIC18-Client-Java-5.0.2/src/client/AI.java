package client;

import client.model.*;
import common.util.Log;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

import static common.network.JsonSocket.TAG;

/**
 * AI class.
 * You should fill body of the method {@link }.
 * Do not change name or modifiers of the methods or fields
 * and do not add constructor for this class.
 * You can add as many methods or fields as you want!
 * Use world parameter to access and modify game's
 * world!
 * See World interface for more details.
 */
public class AI {

    Random rnd=new Random();
    Integer attackMoney, defenceMoney;
    private static int savingMoney = 1000;
    private static double attackInvest = 0.1;
    private static double defenceInvest = 0.9;

    private Defence defence;

    private void  lighDefense(World game){
        if (defence == null)
            defence = new Defence(game);
        defence.resist(game, defenceMoney);
    }

    final static int attackCycles = 5;
    static int attackTimeIndex = 0;
    static boolean secondTime = false;
    static int ss = 0;

    void simpleTurn(World game) {
        System.out.println(game.getCurrentTurn());
        Log.d(TAG,"lightTurn Called"+" Turn:"+game.getCurrentTurn());
        Player myInformation = game.getMyInformation();
        attackMoney = (int) (attackInvest * (myInformation.getMoney() - savingMoney));
        defenceMoney = (int) (defenceInvest * (myInformation.getMoney() - savingMoney));
//        System.out.println(myInformation.getMoney() + " " + attackMoney + " " + defenceMoney + " " + savingMoney);

        Attack(game);
        lighDefense(game);
        storm(game);
        plant(game);
    }

    static int plantTime = 425;
    private void plant(World game) {
        if (game.getCurrentTurn() >= plantTime) {
            int plantDelay = (int) (game.getAttackMapPaths().get(bestPath).getRoad().size() * 0.42);
            ArrayList<Tower> towers = game.getVisibleEnemyTowers();
            for (Tower t : game.getVisibleEnemyTowers()) {
                for (RoadCell r : game.getAttackMapPaths().get(bestPath).getRoad()) {
                    boolean checkIfFound = true;
                    for (int i = 0; i < 12; i++) {
                        int nx = r.getLocation().getX() + ix[i], ny = r.getLocation().getY() + iy[i];
                        if (t.getLocation().getX() == nx && t.getLocation().getY() == ny) {
                            towers.add(t);
                            checkIfFound = false;
                            break;
                        }
                    }
                    if (!checkIfFound) {
                        break;
                    }
                }
            }
//        int maxX = -1, maxY = -1;
//        double MAX = -1;
//        for(Tower tower : towers){
//            Point p = tower.getLocation();
//            int x = p.getX(), y = p.getY();
//            if(seenExpected[y][x] > MAX){
//                MAX = seenExpected[y][x];
//                maxX = x;
//                maxY = y;
//            }
//        }
//        if(MAX > 0 && game.getCurrentTurn() > plantCycle) {
//            game.plantBean(maxX, maxY);
//            plantCycle += 1;
//        }
            towers.sort(new TowerComperator());
            if (game.getCurrentTurn() > plantTime + plantDelay && towers.size() > 0) {
                game.plantBean(towers.get(0).getLocation().getX(), towers.get(0).getLocation().getY());
                System.out.println("planted in: " + towers.get(0).getLocation().getX() + "," + towers.get(0).getLocation().getY());
            }
        }
    }

    class TowerComperator implements Comparator {
        @Override
        public int compare(Object o1, Object o2) {
            Tower t1 = (Tower)o1, t2 = (Tower) o2;
            int pt1 = 0, pt2 = 0;
            pt1 += t1.getLevel();
            pt2 += t2.getLevel();
            if (t1 instanceof CannonTower) {
                pt1 *= 2;
            }
            if (t2 instanceof CannonTower) {
                pt2 *= 2;
            }
            return pt2 - pt1;
        }
    }

    static int MAX_LIMIT_UNIT = 12;
    static int ix[] = {0, 1, 0, -1, 0, 1, 2, 1, 0, -1, -2, -1}, iy[] = {1, 0, -1, 0, 2, 1, 0, -1, -2, -1, 0, 1};

    static int stormNeedInd = 0;

    private void storm(World game) {
        int[][] unitgrid = new int[game.getAttackMap().getHeight() + 30][game.getAttackMap().getWidth() + 30];
        ArrayList<Unit> enemyUnits = game.getEnemyUnits();
        int MAX = -1, maxX = -1, maxY = -1;
        for(Unit unit : enemyUnits){
            Point p = unit.getLocation();
            int x = p.getX(), y = p.getY();
            for(int i = 0; i < 12; i++) {
                int nx = x + ix[i], ny = y + iy[i];
                if (isInside(nx, ny, game))
                    unitgrid[ny][nx]++;
            }
            if(unitgrid[y][x] > MAX){
                MAX = unitgrid[y][x];
                maxX = x;
                maxY = y;
            }
        }
        if(MAX > MAX_LIMIT_UNIT) {
            if(stormNeedInd < 10)
                stormNeedInd++;
            else {
                game.createStorm(maxX, maxY);
                MAX_LIMIT_UNIT += 4;
                stormNeedInd = 0;
            }
        }

    }

    private boolean isInside(int nx, int ny, World game) {
        if(nx < 0 || ny < 0 || nx >= game.getAttackMap().getWidth() || ny >= game.getAttackMap().getHeight())
            return false;
        return true;
    }


    void complexTurn(World game) {

        Log.d(TAG,"HeavyTurn Called"+" Turn:"+game.getCurrentTurn());
        Player myInformation = game.getMyInformation();
        savingMoney += 3 * myInformation.getIncome() / 5;
        findBestPath(game);
        simpleTurn(game);
    }

    static int attackPower = 10;
    private void Attack(World game) {
        int[] attackTime = {1, 20, 50, 90, 140, 200, 270, 350, 440, 540, 650, 760, 880, 960, 990, 10001};
        if(game.getCurrentTurn() == attackTime[attackTimeIndex]){
            attackPower += attackTimeIndex;
            System.out.println("here " + game.getCurrentTurn());
            attackMoney += savingMoney / 2;
            ss = savingMoney / 2;
            savingMoney = 0;
            attackTimeIndex++;
            secondTime = true;
        }else if(secondTime){
            attackMoney += ss;
            secondTime = false;
        }
        lightAttack(game);
    }

    static int bestPath = -1, bestPathThreat = -1;
    static int lightunitCnt = 0, heavyunitCnt = 0;
    int[] pathCanon = new int[100];

    private void lightAttack(World game) {
        int lightUnitPrice = LightUnit.INITIAL_PRICE + lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD * LightUnit.PRICE_INCREASE;
        int heavyUnitPrice = HeavyUnit.INITIAL_PRICE + heavyunitCnt / HeavyUnit.LEVEL_UP_THRESHOLD * HeavyUnit.PRICE_INCREASE;
        double lightUnitPower = Math.pow(1.4, lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD) * LightUnit.INITIAL_HEALTH;
        System.out.println("light unit price " + lightUnitPrice);
        Player myInformation = game.getMyInformation();
        ArrayList<Path> paths = game.getAttackMapPaths();
        if(bestPath == -1)
            findBestPath(game);
        int myMoney = attackMoney;
        int bestPathCanon = pathCanon[bestPath];
        System.out.println(bestPathCanon + " --- " + (int)lightUnitPower);
        if(bestPathCanon > (int)lightUnitPower)
            while(myMoney - heavyUnitPrice > 0) {
                game.createHeavyUnit(bestPath);
                heavyunitCnt++;
                myMoney -= heavyUnitPrice;
            }
        else
            while(myMoney - lightUnitPrice > 0) {
                game.createLightUnit(bestPath);
                lightunitCnt++;
                myMoney -= lightUnitPrice;
            }
    }

    private void findBestPath(World game) {
        ArrayList<Path> paths = game.getAttackMapPaths();
        int width = game.getAttackMap().getWidth(), heigt = game.getAttackMap().getHeight();
        int[][] threatPointArcher = new int[heigt][width], threatPointCanon = new int[heigt][width];
        int pathCnt = paths.size();
        int[] pathPoint = new int[pathCnt];
        ArrayList<Tower> towers = game.getVisibleEnemyTowers();
        for(Tower tower : towers){
            Point p = tower.getLocation();
            for(int i = 0; i < 12; i++) {
                int x = p.getX() + ix[i], y = p.getY() + iy[i];
                if (x >= 0 && x < width && y >= 0 && y < heigt)
                    if(tower.getClass() == ArcherTower.class)
                        threatPointArcher[y][x] += tower.getDamage();
                    else
                        threatPointCanon[y][x] += tower.getDamage();
            }
        }
        for(int i = 0; i < pathCnt; i++)
            pathCanon[i] = 0;

        for(int i = 0; i < pathCnt; i++) {
            ArrayList<RoadCell> roadCells = paths.get(i).getRoad();
            for(RoadCell cell : roadCells) {
                Point p = cell.getLocation();
                pathPoint[i] += threatPointArcher[p.getY()][p.getX()] + threatPointCanon[p.getY()][p.getX()] * attackPower;
                pathCanon[i] += threatPointCanon[p.getY()][p.getX()];
            }
            pathPoint[i] += roadCells.size();
        }
        bestPath = 0;
        for(int i = 0; i < pathCnt; i++)
            if(pathPoint[i] < pathPoint[bestPath]) {
                bestPath = i;
                bestPathThreat = pathPoint[i];
            }
    }
}