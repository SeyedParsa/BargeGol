package client;

import client.model.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by seyedparsa on 3/8/2018 AD.
 */
public class Defence {
    private static double footprintRecall = 0.9;
    private static double infectionFactor = 0.3;
    private Double[][] footprint;
    private Double[][] seen;
    private Double[][] gonnaSee;
    private Double[][] heat;
    private Map map;
    private int H, W;
    private Double[][] latelen;
    private Double[][] adj;
    private Double[][] goodness;
    private List<Tower> myArchers, myCannons;
    private Tower[][] myTowers;



    Defence(World game){
        map = game.getDefenceMap();
        H = map.getHeight();
        W = map.getWidth();
        footprint = new Double[H][W];
        seen = new Double[H][W];
        gonnaSee = new Double[H][W];
        heat = new Double[H][W];
        latelen = new Double[H][W];
        adj = new Double[H][W];
        goodness = new Double[H][W];
        myArchers = new ArrayList<>();
        myCannons = new ArrayList<>();
        myTowers = new Tower[H][W];
        for (Path path : game.getDefenceMapPaths()){
            for (Cell cell : path.getRoad()){
                int x = cell.getLocation().getX(), y = cell.getLocation().getY();
                if (footprint[y][x] == null) footprint[y][x] = 0d;
                //footprint[y][x] += (1-footprintRecall);
                heat[y][x] = 0d;
            }
        }
        for (Cell cell : map.getCellsList())
            if (game.isTowerConstructable(cell)) {
                int x = cell.getLocation().getX(), y = cell.getLocation().getY();
                seen[y][x] = 0d;
                gonnaSee[y][x] = 0d;
                latelen[y][x] = 0d;
                adj[y][x] = 0d;
                goodness[y][x] = 0d;
            }
        myArchers = new ArrayList();
        myCannons = new ArrayList();
    }

    private void distribute(World game, int step){
        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++)
                if (gonnaSee[i][j] != null)
                    gonnaSee[i][j] = 0d;
        for (Path path : game.getDefenceMapPaths()){
            for (int i = 0; i < path.getRoad().size(); i++){
                Cell cell = path.getRoad().get(i);
                int x = cell.getLocation().getX(), y = cell.getLocation().getY();
                double add = footprint[y][x];
                for (int j = (i + step < path.getRoad().size() ? i + step : path.getRoad().size()-1); j >= i; j--){
                    cell = path.getRoad().get(j);
                    x = cell.getLocation().getX();
                    y = cell.getLocation().getY();
                    for (int ii = -2; ii <= 2; ii++)
                        for (int jj = -2; jj <= 2; jj++) {
                            int yy = y + ii, xx = x + jj;
                            if (Math.abs(ii) + Math.abs(jj) <= 2 && xx >= 0 && xx < W && yy >= 0 && yy < H && seen[yy][xx] != null)
                                gonnaSee[yy][xx] += (j == i ? add : add/2);
                        }
                    add /= 2;
                }
            }
        }
        /*for (int i = 0; i < h; i++)
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
            }*/
    }

    private void computeSeen(){
        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++)
                if (seen[i][j] != null) {
                    seen[i][j] = 0d;
                    for (int ii = -2; ii <= 2; ii++)
                        for (int jj = -2; jj <= 2; jj++) {
                            int y = i + ii, x = j + jj;
                            if (Math.abs(ii) + Math.abs(jj) <= 2 && x >= 0 && x < W && y >= 0 && y < H && footprint[y][x] != null)
                                seen[i][j] += footprint[y][x];
                        }
                }
    }

    private void computeStep(World game){
        for (Unit unit : game.getEnemyUnits()) {
            int x = unit.getLocation().getX(), y = unit.getLocation().getY();
            int w = (unit instanceof LightUnit ? LightUnit.INITIAL_HEALTH : HeavyUnit.INITIAL_HEALTH);
            heat[y][x] += w;
        }

        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++)
                if (footprint[i][j] != null)
                    footprint[i][j] = (footprint[i][j]/(1-footprintRecall)*footprintRecall + heat[i][j]) * (1-footprintRecall);
    }

    private void computeLateLen(World game){
        for (Path path : game.getDefenceMapPaths()){
            int len = path.getRoad().size();
            int ind = 0;
            for (Cell cell : path.getRoad()){
                ind++;
                int x = cell.getLocation().getX(), y = cell.getLocation().getY();
                for (int ii = -2; ii <= 2; ii++)
                    for (int jj = -2; jj <= 2; jj++) {
                        int yy = y + ii, xx = x + jj;
                        if (Math.abs(ii) + Math.abs(jj) <= 2 && xx >= 0 && xx < W && yy >= 0 && yy < H && seen[yy][xx] != null)
                            latelen[yy][xx] = Math.max(latelen[yy][xx], (double)ind/(len*len));
                    }
            }
        }
    }

    private void computeAdj(){
        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++)
                if (seen[i][j] != null) {
                    adj[i][j] = 0d;
                    for (int ii = -2; ii <= 2; ii++)
                        for (int jj = -2; jj <= 2; jj++) {
                            int y = i + ii, x = j + jj;
                            if (Math.abs(ii) + Math.abs(jj) <= 2 && x >= 0 && x < W && y >= 0 && y < H && footprint[y][x] != null)
                                adj[i][j]++;
                        }
                }
    }

    private void Sort(List<Integer> list, Double[][] array){
        for (int i = 0; i < list.size(); i++)
            for (int j = i+1; j < list.size(); j++){
                int a = list.get(i), b = list.get(j);
                if (array[a/W][a%W] < array[b/W][b%W]){
                    int tmp = list.get(i);
                    list.set(i, list.get(j));
                    list.set(j, tmp);
                }
            }
    }

    private void createTower(World game, int money){
        //gonnaSee, lateLen, adj
        List<Integer> candidates = new ArrayList<>();
        int w = map.getWidth(), h = map.getHeight();
        int x = -1, y = -1;
        double bst = 0d;
        for (int i = 0; i < h; i++)
            for (int j = 0; j < w; j++) {
                double cur = 0;
                if (myTowers[i][j] != null || game.isTowerConstructable(map.getCellsGrid()[i][j])){
                    int lvl = (myTowers[i][j] == null ? 0 : myTowers[i][j].getLevel());
                    candidates.add(i*w + j);
                    gonnaSee[i][j] = cur = 1.0/(lvl+1)/(lvl+1)*gonnaSee[i][j]*latelen[i][j]*adj[i][j];
                }
                if (x == -1 || cur > bst) {
                    bst = cur;
                    x = j;
                    y = i;
                }
            }
        Sort(candidates, seen);
        for (int i = 0; i < 5; i++)
            System.out.print(seen[candidates.get(i)/W][candidates.get(i)%W] + " ");
        System.out.println();
        Sort(candidates, gonnaSee);
        for (int i = 0; i < 5; i++)
            System.out.print(gonnaSee[candidates.get(i)/W][candidates.get(i)%W] + " ");
        System.out.println();
        Sort(candidates, latelen);
        for (int i = 0; i < 5; i++)
            System.out.print(latelen[candidates.get(i)/W][candidates.get(i)%W] + " ");
        System.out.println();
        Sort(candidates, adj);
        for (int i = 0; i < 5; i++)
            System.out.print(adj[candidates.get(i)/W][candidates.get(i)%W] + " ");
        System.out.println();
        System.out.println();
        System.out.println();
        if (x != -1) {
            int lvl = (myTowers[y][x] == null ? 0 : myTowers[y][x].getLevel());
            int prc = (myTowers[y][x] == null ? archerPrice() : archerLevelUpPrice(lvl));
            if (prc <= money) {
                System.out.println("Let's create a tower at " + x + "," + y + "(" + (lvl+1) + "," + prc + ")" + " because of " + gonnaSee[y][x]);
                if (myTowers[y][x] == null)
                    game.createArcherTower(1, x, y);
                else
                    game.upgradeTower(myTowers[y][x]);
            }
            else
                System.out.println("Pool nakafi: " + money + " " + prc);
        }
        else
            System.out.println((x == -1 ? "Not Found Error" : "Epsilon Error"));
    }

    public void resist(World game, int money){
        map = game.getDefenceMap();
        for (int i = 0; i < H; i++)
            for (int j = 0; j < W; j++) {
                if (heat[i][j] != null)
                    heat[i][j] = 0d;
                myTowers[i][j] = null;
            }
        myArchers.clear();
        myCannons.clear();
        for (Tower tower : game.getMyTowers()) {
            myTowers[tower.getLocation().getY()][tower.getLocation().getX()] = tower;
            if (tower instanceof ArcherTower) myArchers.add(tower);
            if (tower instanceof CannonTower) myCannons.add(tower);
        }
        computeLateLen(game);
        computeAdj();
        computeStep(game);
        distribute(game, 5);
        computeSeen();
        createTower(game, money);
        /*System.out.println(game.getCurrentTurn());
        System.out.println("LateLen:");
        print(latelen);
        System.out.println("Adj:");
        print(adj);
        System.out.println("Foot:");
        print(footprint);
        System.out.println("Seen:");
        print(seen);
        System.out.println("GonnaSee:");
        print(gonnaSee);
        System.out.println("-------------------\n\n\n");*/
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

    private void print(Double[][] array){
        for (int i = 0; i < H; i++) {
            for (int j = 0; j < W; j++)
                if (array[i][j] == null)
                    System.out.print(" ****");
                else
                    System.out.printf("%5.2f", array[i][j]);
            System.out.println();
        }
    }

}
