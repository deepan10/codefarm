
import { names, exporter } from "ui-lib/exporter";
import theme from "./theme.scss";

const name = names.DATA_CHIP;
const exports = {
    TypeChip: require("./TypeChip"),
    ChipList: require("./ChipList")
};

module.exports = exporter(name, theme, exports);
