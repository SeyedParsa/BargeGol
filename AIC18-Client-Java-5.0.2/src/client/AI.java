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
    private static boolean LOG = false;
    private static double recallC = 0.9;
    private static double distributionC = 0.3;

    private Double[][] beingProb, beingBackupProb;
    private Double[][] seenExpected;
    private Double[][] enemyAt;
    private Tower[][] myTowers;
    private List<Tower> myArchers, myCannons;

    private void computeSeen(int h, int w){
//        System.out.println("Let's See");
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                if (seenExpected[i][j] != null) {
                    seenExpected[i][j] = 0d;
                    for (int ii = -1; ii <= 1; ii++)
                        for (int jj = -1; jj <= 1; jj++) {
                            int y = i + ii, x = j + jj;
                            if (x >= 0 && x < w && y >= 0 && y < h && beingProb[y][x] != null)
                                seenExpected[i][j] += beingProb[y][x];
                        }
                }
          /*      if (LOG) {
                    if (seenExpected[i][j] == null)
                        System.out.print("-.-- ");
                    else
                        System.out.printf("%.2f ", seenExpected[i][j]);
                }*/
            }
//            if (LOG) System.out.println();
        }
    }

    private void distribute(Double[][] res, Double[][] backup, int h, int w, double alpha){
        for (int i = 0; i < h; i++)
            for (int j = 0; j < w; j++){
                if (res[i][j] == null) continue;
                backup[i][j] = res[i][j];
                res[i][j] = 0d;
            }
        for (int i = 0; i < h; i++)
            for (int j = 0; j < w; j++){
                if (res[i][j] == null) continue;
                int cnt = 0;
                double sum = 0;
                for (int ii = -1; ii <= 1; ii++)
                    for (int jj = -1; jj <= 1; jj++){
                        int y = i + ii, x = j + jj;
                        if (x >= 0 && x < w && y >= 0 && y < h && backup[y][x] != null){
                            sum += backup[y][x];
                            cnt++;
                        }
                    }
                if (cnt == 0){
                    res[i][j] = backup[i][j];
                }
                else
                    res[i][j] = (backup[i][j]*alpha + sum/cnt*(1-alpha));
            }
    }

    int archerPrice(){
        return ArcherTower.INITIAL_PRICE + myArchers.size()*ArcherTower.INITIAL_PRICE_INCREASE;
    }

    int archerDamage(int lvl){
        double res = ArcherTower.INITIAL_DAMAGE;
        for (int i = 0; i < lvl-1; i++)
            res *= 1.4;
        return (int)res;
    }

    int archerLevelUpPrice(int lvl){
        double res = ArcherTower.INITIAL_LEVEL_UP_PRICE;
        for (int i = 0; i < lvl-1; i++)
            res *= 1.5;
        return (int)res;
    }

    int cannonPrice(){
        return CannonTower.INITIAL_PRICE + myCannons.size()*CannonTower.INITIAL_PRICE_INCREASE;
    }

    private void createTower(World game, Map map){
        int w = map.getWidth(), h = map.getHeight();
        int x = -1, y = -1;
        double bst = 0d;
        for (int i = 0; i < h; i++)
            for (int j = 0; j < w; j++) {
                double cur = 0;
                if (myTowers[i][j] != null || game.isTowerConstructable(map.getCellsGrid()[i][j])){
                    int lvl = (myTowers[i][j] == null ? 0 : myTowers[i][j].getLevel());
                    cur = seenExpected[i][j] - lvl*100000;
                }
                if (x == -1 || cur > bst) {
                    bst = cur;
                    x = j;
                    y = i;
                }
            }
        if (x != -1 && seenExpected[y][x] > 1e-7) {
            int lvl = (myTowers[y][x] == null ? 0 : myTowers[y][x].getLevel());
            int prc = (myTowers[y][x] == null ? archerPrice() : archerLevelUpPrice(lvl));
            if (prc <= defenceMoney) {
                System.out.println("Let's create a tower at " + x + "," + y + "(" + (lvl+1) + "," + prc + ")" + " because of " + seenExpected[y][x]);
                if (myTowers[y][x] == null)
                    game.createArcherTower(1, x, y);
                else
                    game.upgradeTower(myTowers[y][x]);
            }
            else
                System.out.println("Pool nakafi: " + defenceMoney + " " + prc);
        }
        else
            System.out.println((x == -1 ? "Not Found Error" : "Epsilon Error"));
    }

    private void  lighDefense(World game){
        Map defMap = game.getDefenceMap();
        int W = defMap.getWidth(), H = defMap.getHeight();
        if (beingProb == null){
            beingProb = new Double[H][W];
            beingBackupProb = new Double[H][W];
            seenExpected = new Double[H][W];
            enemyAt = new Double[H][W];
            myTowers = new Tower[H][W];
            for (Path path : game.getDefenceMapPaths()){
                for (Cell cell : path.getRoad()){
                    int x = cell.getLocation().getX(), y = cell.getLocation().getY();
                    if (beingProb[y][x] == null) beingProb[y][x] = 0d;
                    beingProb[y][x] += (1-recallC);
                    enemyAt[y][x] = 0d;
                }
            }
            for (Cell cell : defMap.getCellsList())
                if (game.isTowerConstructable(cell))
                    seenExpected[cell.getLocation().getY()][cell.getLocation().getX()] = 0d;
            myArchers = new ArrayList();
            myCannons = new ArrayList();
        }
        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++) {
                if (enemyAt[i][j] != null)
                    enemyAt[i][j] = 0d;
                myTowers[i][j] = null;
            }
        myArchers.clear();
        myCannons.clear();
        for (Tower tower : game.getMyTowers()) {
            myTowers[tower.getLocation().getY()][tower.getLocation().getX()] = tower;
            if (tower instanceof ArcherTower) myArchers.add(tower);
            if (tower instanceof CannonTower) myCannons.add(tower);
        }
        for (Unit unit : game.getEnemyUnits()) {
            int x = unit.getLocation().getX(), y = unit.getLocation().getY();
            int w = (unit instanceof LightUnit ? LightUnit.INITIAL_HEALTH : HeavyUnit.INITIAL_HEALTH);
            enemyAt[y][x] += w;
            /*Path path = unit.getPath();
            if (path == null){
                System.out.println("Ey DAD!");
            }
            ArrayList <Cell> willSee = new ArrayList<>();
            boolean f = false;
            for (Cell cell : path.getRoad()) {
                if (cell.getLocation().getX() == x && cell.getLocation().getY() == y)
                    f = true;
                if (f && willSee.size() < 4)
                    willSee.add(cell);
            }
            double co = 1d;
            int lyw = -1, lwx = -1;
            for (int i = willSee.size()-1; i >= 0; i--){
                int xw = willSee.get(i).getLocation().getX(),
                        yw = willSee.get(i).getLocation().getY();
                if (lyw != -1)
                    enemyAt[lyw][lwx] -= co*w;
                enemyAt[yw][xw] += co*w;
                lyw = yw;
                lwx = xw;
                co *= 1.0/2;
            }*/
        }
        for (int i = 0; i < H; i++) {
            for (int j = 0; j < W; j++) {
                if (beingProb[i][j] != null)
                    beingProb[i][j] = (beingProb[i][j]/(1-recallC)*recallC + enemyAt[i][j]) * (1-recallC);
      /*          if (LOG) {
                    if (beingProb[i][j] == null)
                        System.out.print("-.-- ");
                    else
                        System.out.printf("%.2f ", beingProb[i][j]);
                }*/
            }
            if (LOG) System.out.println();
        }
        distribute(beingProb, beingBackupProb, defMap.getHeight(), defMap.getWidth(), 1-distributionC);
        computeSeen(defMap.getHeight(), defMap.getWidth());
        createTower(game, defMap);
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

    static int plantCycle = 100;

    private void plant(World game) {
        ArrayList<Tower> towers = game.getVisibleEnemyTowers();
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
        if (game.getCurrentTurn() > plantCycle && towers.size() > 0) {
            game.plantBean(towers.get(0).getLocation().getX(), towers.get(0).getLocation().getY());
            System.out.println("planted in: " + towers.get(0).getLocation().getX() + "," + towers.get(0).getLocation().getY());
            plantCycle += 50;
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
            return pt1 - pt2;
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