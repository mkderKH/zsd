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
            众神殿王者之归来，致力为亿万星辰梦想家提供一个平等，互利，共赢，为实现Wed3.0和区块链技术无限魅力，随着区块链通证经济的发展，将会有更多的生态和功能的加入，为各位老板创造更大价值的财富盛宴！
          </div>
        }
      ></Content>
      <Market />
    </MenuProvider>
  );
};

export default HomeLess;
