package client;

import client.model.*;
import common.util.Log;

import java.util.*;

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

        attack(game);
        lighDefense(game);
        storm(game);
        plant(game);
    }

    static int plantTime = 440;
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

    static int MAX_LIMIT_UNIT = 2;
    static int ix[] = {0, 1, 0, -1, 0, 1, 2, 1, 0, -1, -2, -1}, iy[] = {1, 0, -1, 0, 2, 1, 0, -1, -2, -1, 0, 1};

//    static int stormNeedInd = 0;

    static int waitingForStorm = 20;

    static int usedStorms = 0;

    static int minPt = MAX_LIMIT_UNIT;

    private void storm(World game) {
        if (Game.INITIAL_STORMS_COUNT - usedStorms > 0) {
            if (game.getCurrentTurn() > waitingForStorm) {
                for (Path p : game.getDefenceMapPaths()) {
                    for (int i = p.getRoad().size() - 1; i >= p.getRoad().size() * 7 / 8; i--) {
                        int pt2 = 0;
                        if (p.getRoad().get(i).getUnits().size() - MAX_LIMIT_UNIT > 0) {
                            pt2 = p.getRoad().get(i).getUnits().size() - MAX_LIMIT_UNIT;

                        }
                        int pt = p.getRoad().get(i).getUnits().size() + pt2 * 2 - towersAround(game, p, i - 2) * 2;
                        if (pt > minPt) {
                            System.out.println("ghazabe khoda bar: " + (p.getRoad().size() - i) + "omin ba sarbaz:" + p.getRoad().get(i).getUnits().size() + " dar " + p.getRoad().get(i).getLocation().getX() + " " + p.getRoad().get(i).getLocation().getY());
                            game.createStorm(p.getRoad().get(i).getLocation().getX(), p.getRoad().get(i).getLocation().getY());
                            usedStorms++;
//                            MAX_LIMIT_UNIT += MAX_LIMIT_UNIT / 2;
                            return;
                        }
                    }
                }
            }
        }
        for (Path p : game.getDefenceMapPaths()) {
            ArrayList<Unit> unitsInEnd = new ArrayList<Unit>();
            unitsInEnd.addAll(p.getRoad().get(p.getRoad().size() - 1).getUnits());
            unitsInEnd.addAll(p.getRoad().get(p.getRoad().size() - 2).getUnits());
            int enemyNum = 0;
            for (Unit u : unitsInEnd) {
                if (u instanceof HeavyUnit) {
                    enemyNum += 5;
                } else {
                    enemyNum++;
                }
            }
            if (enemyNum >= game.getMyInformation().getStrength()) {
                game.createStorm(p.getRoad().get(p.getRoad().size() - 1).getLocation().getX(), p.getRoad().get(p.getRoad().size() - 1).getLocation().getY());
            } else {
                if (game.getCurrentTurn() > 500) {
                    System.out.println("strength: " + game.getMyInformation().getStrength() + "enemies: " + enemyNum);
                }
            }
        }

//        game.getDefenceMapPaths().get(0).getRoad().get(game.getDefenceMapPaths().get(0).getRoad().size() - 1).getLocation()
//        int[][] unitgrid = new int[game.getAttackMap().getHeight() + 30][game.getAttackMap().getWidth() + 30];
//        ArrayList<Unit> enemyUnits = game.getEnemyUnits();
//        int MAX = -1, maxX = -1, maxY = -1;
//        for(Unit unit : enemyUnits){
//            Point p = unit.getLocation();
//            int x = p.getX(), y = p.getY();
//            for(int i = 0; i < 12; i++) {
//                int nx = x + ix[i], ny = y + iy[i];
//                if (isInside(nx, ny, game))
//                    unitgrid[ny][nx]++;
//            }
//            if(unitgrid[y][x] > MAX){
//                MAX = unitgrid[y][x];
//                maxX = x;
//                maxY = y;
//            }
//        }
//        if(MAX > MAX_LIMIT_UNIT) {
//            if(stormNeedInd < 10)
//                stormNeedInd++;
//            else {
//                game.createStorm(maxX, maxY);
//                MAX_LIMIT_UNIT += 4;
//                stormNeedInd = 0;
//            }
//        }

    }

    int towersAround(World game, Path path, int ind) {
        HashSet<Tower> towerHashSet = new HashSet<Tower>();
        for (int j = ind; j < path.getRoad().size(); j++) {
            int x = path.getRoad().get(j).getLocation().getX(), y = path.getRoad().get(j).getLocation().getY();
            for (int i = 0; i < 12; i++) {
                for (Tower t : game.getMyTowers()) {
                    int nx = x + ix[i], ny = y + iy[i];
                    if (isInside(nx, ny, game)) {
                        if (t.getLocation().getX() == nx && t.getLocation().getY() == ny) {
                            towerHashSet.add(t);
                        }
                    }
                }
            }
        }
        return towerHashSet.size();
    }


    private boolean isInside(int nx, int ny, World game) {
        if(nx < 0 || ny < 0 || nx >= game.getAttackMap().getWidth() || ny >= game.getAttackMap().getHeight())
            return false;
        return true;
    }


    void complexTurn(World game) {

        Log.d(TAG,"HeavyTurn Called"+" Turn:"+game.getCurrentTurn());
        Player myInformation = game.getMyInformation();
        if(game.getCurrentTurn() < 500)
            savingMoney += 3 * myInformation.getIncome() / 5;
        else
            savingMoney += 4 * myInformation.getIncome() / 5;
        findBestPath(game);
        simpleTurn(game);
    }


    static int attackPower = 10;
    static int FIRST_ATTACK = 30;
    private void attack(World game) {
        int[] attackTime = {90, 140, 200, 270, 350, 500, 610, 720, 880, 10001};
        if(game.getCurrentTurn() == attackTime[attackTimeIndex]) {
            attackPower += attackTimeIndex;
            System.out.println("here " + game.getCurrentTurn());
            attackMoney += savingMoney;
            savingMoney = 0;
            attackTimeIndex++;
            bestAttackStrategy(game);
            return;
        }
        if(game.getCurrentTurn() < FIRST_ATTACK)
            primitiveAttack(game);

        lightAttack(game);
    }

    private void bestAttackStrategy(World game) {

        int lightUnitPrice = LightUnit.INITIAL_PRICE + lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD * LightUnit.PRICE_INCREASE;
        int heavyUnitPrice = HeavyUnit.INITIAL_PRICE + heavyunitCnt / HeavyUnit.LEVEL_UP_THRESHOLD * HeavyUnit.PRICE_INCREASE;

        int lightUnitHealth = (int)((double)LightUnit.INITIAL_HEALTH * Math.pow(1.3, lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD));
        int heavyUnitHealth = (int)((double)HeavyUnit.INITIAL_HEALTH * Math.pow(1.3, heavyunitCnt / HeavyUnit.LEVEL_UP_THRESHOLD));


        Player myInformation = game.getMyInformation();
        ArrayList<Path> paths = game.getAttackMapPaths();
        if(bestPath == -1)
            findBestPath(game);
        int myMoney = attackMoney;
        int heavyunitCnttmp = 0, lightunitCnttmp = 0;
        while(myMoney - heavyUnitPrice > 0) {
            heavyunitCnttmp++;
            myMoney -= heavyUnitPrice;
        }
        myMoney = attackMoney;
        while(myMoney - lightUnitPrice > 0) {
            lightunitCnttmp++;
            myMoney -= lightUnitPrice;
        }
        myMoney = attackMoney;


        int pathCnt = paths.size();
        int bestPathSurvival = -1;
        boolean lightUnit = false;
        for(int i = 0; i < pathCnt; i++){
            int survivorCnt = numberOfSurvivors(game, paths, i, lightunitCnttmp, lightUnitHealth, true);
            System.out.println("light:  " + "count of units " + lightunitCnttmp + " health of units " + lightUnitHealth + " -> " + survivorCnt);
            if(survivorCnt > bestPathSurvival) {
                bestPathSurvival = survivorCnt;
                bestPath = i;
                lightUnit = true;
            }
        }

        for(int i = 0; i < pathCnt; i++){
            int survivorCnt = numberOfSurvivors(game, paths, i, heavyunitCnttmp, heavyUnitHealth, false);
            System.out.println("heavy:  " + "count of units " + heavyunitCnttmp + " health of units " + heavyUnitHealth + " -> " + survivorCnt);
            if(survivorCnt * 5 > bestPathSurvival) {
                bestPathSurvival = survivorCnt * 5;
                bestPath = i;
                lightUnit = false;
            }
        }
        System.out.println("bestPathSurvival  " + bestPathSurvival);
        if(bestPathSurvival > 0) {
            if (lightUnit)
                for (int i = 0; i < lightunitCnttmp; i++, lightunitCnt++)
                    game.createLightUnit(bestPath);
            else
                for (int i = 0; i < heavyunitCnttmp; i++, heavyunitCnt++)
                    game.createHeavyUnit(bestPath);
        }else{
            findBestPath(game);
            for (int i = 0; i < lightunitCnttmp; i++, lightunitCnt++)
                game.createLightUnit(bestPath);
        }

    }

    private int numberOfSurvivors(World game, ArrayList<Path> paths, int pathNumber, int survivorCnt, int currentHealth, boolean lightUnit) {
        int width = game.getAttackMap().getWidth(), heigt = game.getAttackMap().getHeight();
        boolean[][] mark = new boolean[heigt][width];
        ArrayList<RoadCell> roadCells = paths.get(pathNumber).getRoad();
        for(RoadCell cell : roadCells) {
            Point p = cell.getLocation();
            mark[p.getY()][p.getX()] = true;
        }

        ArrayList<Tower> towers = game.getVisibleEnemyTowers();
        int life = currentHealth;
        for(Tower tower : towers) {
            Point p = tower.getLocation();
            int t = 0;
            for (int j = 0; j < 12; j++) {
                int x = p.getX() + ix[j], y = p.getY() + iy[j];
                if (isInside(x, y, game) && mark[y][x] == true)
                    t++;
            }
            if(lightUnit)
                t = (t + 1) / 2;
            if(tower.getClass() == ArcherTower.class) {
                while (t > 0) {
                    life -= tower.getDamage();
                    if (life < 0) {
                        life = currentHealth;
                        survivorCnt--;
                    }
                    t--;
                }
            }else
                currentHealth -= t * tower.getDamage();
        }
        if(survivorCnt > 0 & currentHealth > 0)
            return survivorCnt;
        return 0;
    }

    int firstAttackInd = 0;

    private void primitiveAttack(World game) {
        if(game.getCurrentTurn() % 8 == 0) {
            attackMoney += savingMoney / (3 - firstAttackInd);
            savingMoney -= savingMoney / (3 - firstAttackInd++);
        }
        ArrayList<Path> paths = game.getAttackMapPaths();
        int pathCnt = paths.size();
        int[] pathPoint = new int[pathCnt];

        for(int i = 0; i < pathCnt; i++) {
            ArrayList<RoadCell> roadCells = paths.get(i).getRoad();
            pathPoint[i] = roadCells.size();
        }

        for(int j = 0; j < firstAttackInd; j++) {
            pathPoint[bestPath] = 10000;
            bestPath = 0;
            bestPathThreat = 10000;
            for (int i = 0; i < pathCnt; i++)
                if (pathPoint[i] < bestPathThreat) {
                    bestPath = i;
                    bestPathThreat = pathPoint[i];
                }
        }
    }

    static int bestPath = -1, bestPathThreat = -1;
    static int lightunitCnt = 0, heavyunitCnt = 0;
    int[] pathCanon = new int[100];

    private void lightAttack(World game) {
        int lightUnitPrice = LightUnit.INITIAL_PRICE + lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD * LightUnit.PRICE_INCREASE;
        int heavyUnitPrice = HeavyUnit.INITIAL_PRICE + heavyunitCnt / HeavyUnit.LEVEL_UP_THRESHOLD * HeavyUnit.PRICE_INCREASE;
        double lightUnitPower = Math.pow(1.4, lightunitCnt / LightUnit.LEVEL_UP_THRESHOLD) * LightUnit.INITIAL_HEALTH;
//        System.out.println("light unit price " + lightUnitPrice);
        Player myInformation = game.getMyInformation();
        ArrayList<Path> paths = game.getAttackMapPaths();
        if(bestPath == -1)
            findBestPath(game);
        int myMoney = attackMoney;
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
