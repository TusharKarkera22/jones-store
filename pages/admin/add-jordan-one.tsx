import { TextField, Checkbox, Autocomplete, Select, FormControl, FormControlLabel, InputLabel, Input, MenuItem, Button, FormGroup } from "@mui/material";
import { Gender, Category } from "@prisma/client";

const colorways = [ // see sidebar
  {
    name: "Dark Mocha",
    path: "",
  },
  {
    name: "University Blue Black",
    path: "",
  },
  {
    name: "Chicago",
    path: "",
  },
  {
    name: "Lucky Green",
    path: "",
  },
  {
    name: "Pink Glaze",
    path: "",
  },
  {
    name: "Court Purple",
    path: "",
  },
  {
    name: "Clay Green",
    path: "",
  },
  {
    name: "Twist W Panda",
    path: "",
  },
  {
    name: "Midnight Navy",
    path: "",
  },
  {
    name: "Yellow Toe",
    path: "",
  },
  {
    name: "Shadow",
    path: "",
  },
  {
    name: "Bred",
    path: "",
  },
  {
    name: "Varsity Red",
    path: "",
  },
  {
    name: "Fire Red",
    path: "",
  },
  {
    name: "White",
    path: "",
  },
];

export default function AddJordanOne() {
  return (
    <div className="admin__section">
      <form method="POST" action="/api/products">
        <TextField name="id" label="ID" />

        <TextField name="stockQty" label="Stock Quantity" />

        <TextField name="title" label="Title" />

        <TextField name="price" label="Price" />

        <TextField name="discount" label="Discount" />

        <TextField name="shippingCost" label="Shipping Cost" />

        <TextField name="details" fullWidth multiline label="Details" />

        <TextField name="mediaURLs" label="Media URLs" fullWidth multiline minRows={3} />

        <Autocomplete
          disablePortal
          id=""
          options={colorways.map(({name}) => name)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} name="color" label="Main Color" />}
        />

        <FormControl>
          <InputLabel id="">Year</InputLabel>
          <Input name="year" type="number" inputProps={{ min: 1985, max: new Date().getFullYear(), inputMode: "numeric", pattern: '[0-9]*' }} />
        </FormControl>

        <TextField name="sku" label="SKU" />

        <FormControl> {/**Affect sizes array */}
          <InputLabel id="">Gender</InputLabel>
          <Select
            labelId=""
            id=""
            // value={Gender["MEN"]}
            name="gender"
            label="Gender"
            onChange={() => {}}
          >
            {
              Object.keys(Gender).map(gender => (
                <MenuItem key={gender} value={gender}>{gender}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

        <FormGroup>
        {
          [...Array(35)].map((_, i) => 3 + i / 2).map(size => (
            <FormControlLabel control={<Checkbox value={size.toString()} name="sizes" />} key={size} label={size} />
          ))
        }
        </FormGroup>

        <FormControl>
          <InputLabel id="">Type</InputLabel>
          <Select
            labelId=""
            id=""
            name="type"
            label="Category Type"
            onChange={() => {}}
          >
            {
              Object.keys(Category).map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))
            }
          </Select>
        </FormControl>

        <Button type="submit">Add To Inventory</Button>
      </form>
    </div>
  );
}