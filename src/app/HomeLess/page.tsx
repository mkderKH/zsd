import dynamic from "next/dynamic";
const TopMenu = dynamic(() => import("../../../components/TopMenu"), {
  ssr: true,
});
const Content = dynamic(() => import("../../../components/CommBg"), {
  ssr: false,
});
import { MenuProvider } from "../../../components/MenuContext";
import Market from "../../../components/Market";

const HomeLess: React.FC = () => {
  return (
    <MenuProvider>
      <TopMenu />
      <Content
        title={"众神殿"}
        solt={
          <div>
            众神殿之王者归来，致力为大家提供一个平等，互利，共赢，体验web3.0和区块链技术无限魅力！随着游戏的发展，将会有更多的的内容和功能加入，为玩家创造更丰富的体验！
          </div>
        }
      ></Content>
      <Market />
    </MenuProvider>
  );
};

export default HomeLess;
