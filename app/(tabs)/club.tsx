import ButtonComponent from "@/components/Button";
import Page from "@/components/Page";
import {
  enterMeet,
  getClubRecords,
  getSchemaData,
  getWedstrijdData,
  textColor,
} from "@/constants/functions";
import {
  RowRegex,
  TableRegex,
  CellRegex2,
  CarrotRegex,
  IdRegex,
} from "@/constants/regex";
import { Clubrecord, Wedstrijd } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { Fragment, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  useColorScheme,
  Animated,
  View,
  ColorSchemeName,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import SectionComponent from "@/components/SectionComponent";
import Dropdown from "@/components/Dropdown";
import { getItem } from "@/utils/AsyncStorage";

export default function Club() {
  const [schema, setSchema] = useState("");
  const [wedstrijden, setWedstrijden] = useState([] as Wedstrijd[]);
  const [clubrecords, setClubrecords] = useState({ male: [], female: [] } as {
    male: Clubrecord[];
    female: Clubrecord[];
  });

  useEffect(() => {
    const getS = async () => {
      const schema = await getSchemaData();
      setSchema(schema);
    };
    const getW = async () => {
      const wedstrijdenPage = await (
        await fetch("https://www.b-b-z.nl/kalender/?actie=volledig")
      ).text();
      const table = wedstrijdenPage.match(TableRegex)![0];
      const rows = table
        .match(RowRegex)!
        .map((row) => {
          return row
            .match(CellRegex2)
            ?.filter((m) => m != null)
            .map((m) => m.replace(/<td>/g, "").replace(/<\/td>/g, ""))
            .filter((m) => m.length > 0)
            .map((m) => {
              if (m.includes("<a")) {
                let r = m
                  .match(CarrotRegex)![0]
                  .replace(/>/g, "")
                  .replace(/</g, "");
                if (m.includes("?id=")) {
                  r += "SPLITHERE";
                  r += m.match(IdRegex)![0].replace("?id=", "");
                }
                return r;
              }
              return m;
            });
        })
        .filter((s) => s != null)
        .map((w) =>
          w.length > 6
            ? ({
                startDate: new Date(
                  new Date(w[0]).setHours(parseInt(w[5][0] + w[5][1]))
                ),
                endDate: new Date(w[1]),
                name: w[2].split("SPLITHERE")[0],
                location: w[3],
                country: w[4],
                category: w[6],
                id: w[2].split("SPLITHERE")[1],
              } as Wedstrijd)
            : ({
                startDate: new Date(
                  new Date(w[0]).setHours(parseInt(w[4][0] + w[4][1]))
                ),
                name: w[1].split("SPLITHERE")[0],
                location: w[2],
                country: w[3],
                category: w[5],
                id: w[1].split("SPLITHERE")[1],
              } as Wedstrijd)
        );
      setWedstrijden(rows);
    };
    const getC = async () => {
      const clubrecords = await getClubRecords();
      setClubrecords(clubrecords);
    };
    getS();
    getW();
    getC();
  }, []);

  const colorScheme = useColorScheme();

  return (
    <Page>
      <SchemaComponent colorScheme={colorScheme} schema={schema} />
      <WedstrijdenComponent
        colorScheme={colorScheme}
        wedstrijden={wedstrijden}
      />
      <ClubrecordsComponent
        colorScheme={colorScheme}
        clubrecords={clubrecords}
      />
    </Page>
  );
}

function SchemaComponent({
  schema,
  colorScheme,
}: {
  schema: string;
  colorScheme: ColorSchemeName;
}) {
  const currentDate = new Date();
  return (
    <SectionComponent
      title={`Schema van ${currentDate.getDate()}-${
        currentDate.getMonth() + 1
      }-${currentDate.getFullYear()}`}
    >
      <Text style={textColor(colorScheme)}>{schema}</Text>
    </SectionComponent>
  );
}

function WedstrijdenComponent({
  colorScheme,
  wedstrijden,
}: {
  colorScheme: ColorSchemeName;
  wedstrijden: Wedstrijd[];
}) {
  const [modalShown, setModalShown] = useState(false);
  const [selectedWedstrijd, setSelectedWedstrijd] = useState({} as Wedstrijd);
  const [programLoading, setProgramLoading] = useState(false);
  const [chosenProgram, setChosenProgram] = useState([] as number[]);
  const [inschrijfLoading, setInschrijfLoading] = useState(false);

  if (wedstrijden.length > 0) {
    return (
      <Fragment>
        <Modal
          visible={modalShown}
          // transparent={false}
          onRequestClose={() => {
            setModalShown(false);
            setChosenProgram([]);
          }}
          animationType="slide"
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
        >
          <View
            style={{
              flex: 1,
              paddingVertical: 25,
              backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: Dimensions.get("window").width,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    // justifyContent: "space-around",
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      ...textColor(colorScheme),
                      fontWeight: "bold",
                      flex: 1.5,
                      textAlign: "left",
                    }}
                    numberOfLines={1}
                  >
                    {selectedWedstrijd.name}
                  </Text>
                  <Text
                    style={{
                      ...textColor(colorScheme),
                      fontWeight: "bold",
                      flex: 1.5,
                      textAlign: "right",
                    }}
                  >
                    {selectedWedstrijd.endDate != null
                      ? `${selectedWedstrijd.startDate.getDate()}-${selectedWedstrijd.endDate?.toLocaleDateString()}`
                      : `${selectedWedstrijd.startDate?.toLocaleDateString()}`}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    // justifyContent: "space-around",
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      ...textColor(colorScheme),
                      fontWeight: "bold",
                      flex: 1.5,
                      textAlign: "left",
                    }}
                  >
                    {`${selectedWedstrijd.location} - ${selectedWedstrijd.country}`}
                  </Text>
                  <Text
                    style={{
                      ...textColor(colorScheme),
                      fontWeight: "bold",
                      flex: 1.5,
                      textAlign: "right",
                    }}
                  >
                    {selectedWedstrijd.category}
                  </Text>
                </View>
              </View>
              {selectedWedstrijd.enterable && selectedWedstrijd.program && (
                <FlatList
                  data={selectedWedstrijd.program}
                  style={{
                    height: 600,
                    width: Dimensions.get("window").width,
                    marginTop: 0,
                  }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={{
                        backgroundColor: !chosenProgram.includes(
                          parseInt(item.name.split(/\s/)[0])
                        )
                          ? "#2a3137"
                          : "#133914",
                        margin: 10,
                        flex: 1,
                        borderRadius: 10,
                        paddingHorizontal: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 15,
                        flexDirection: "row",
                        minHeight: 10,
                        borderColor: chosenProgram.includes(
                          parseInt(item.name.split(/\s/)[0])
                        )
                          ? "#b7f1b9"
                          : "#2a3137",
                        borderWidth: 1,
                      }}
                      onPress={() => {
                        const programNumber = parseInt(
                          item.name.split(/\s/)[0]
                        );
                        if (chosenProgram.includes(programNumber)) {
                          setChosenProgram(
                            chosenProgram.filter((num) => num !== programNumber)
                          );
                        } else {
                          setChosenProgram([...chosenProgram, programNumber]);
                        }
                      }}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          backgroundColor: !chosenProgram.includes(
                            parseInt(item.name.split(/\s/)[0])
                          )
                            ? "#2a3137"
                            : "#90ea93",
                          borderColor: "#fff",
                          borderWidth: 1,
                          borderRadius: 3,
                          marginHorizontal: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {chosenProgram.includes(
                          parseInt(item.name.split(/\s/)[0])
                        ) && (
                          <FontAwesome
                            name="check"
                            size={15}
                            color="#000"
                            style={{ textAlign: "center" }}
                          ></FontAwesome>
                        )}
                      </View>
                      <Text
                        style={{
                          ...textColor(colorScheme),
                          textAlign: "center",
                          flex: 1,
                        }}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                />
              )}
              {!selectedWedstrijd.enterable && selectedWedstrijd.program && (
                <FlatList
                  data={selectedWedstrijd.program}
                  style={{
                    height: 600,
                    width: Dimensions.get("window").width,
                    marginTop: 0,
                    borderRadius: 10,
                  }}
                  renderItem={({ item, index }) => (
                    <Pressable
                      key={index}
                      style={{
                        backgroundColor: "#2a3137",

                        margin: 10,
                        flex: 1,
                        borderRadius: 10,
                        paddingHorizontal: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 15,
                        flexDirection: "row",
                        minHeight: 10,
                      }}
                      onPress={async () => {
                        if (item.no < 0) return;
                        const pdfUrl = `${selectedWedstrijd.livetimeLink}StartList_${item.no}.pdf`;
                        const docsUrl = `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`;

                        await WebBrowser.openBrowserAsync(docsUrl);
                      }}
                    >
                      <Text style={textColor(colorScheme)}>{item.name}</Text>
                    </Pressable>
                  )}
                />
              )}
              <View style={{ height: 20 }} />
              {selectedWedstrijd.enterable && (
                <ButtonComponent
                  onPress={async () => {
                    setInschrijfLoading(true);
                    await enterMeet(selectedWedstrijd, chosenProgram);
                    setInschrijfLoading(false);
                    setModalShown(false);
                  }}
                >
                  <Text style={textColor(colorScheme === "dark")}>
                    Schrijf in
                  </Text>
                </ButtonComponent>
              )}
              {inschrijfLoading && <ActivityIndicator color="#ef8b22" />}
              <ButtonComponent
                onPress={() => {
                  setModalShown(false);
                  setChosenProgram([]);
                }}
              >
                <Text style={textColor(colorScheme === "dark")}>Sluit</Text>
              </ButtonComponent>
              <View style={{ height: 20 }} />
            </View>
          </View>
        </Modal>
        <SectionComponent title="Wedstrijden">
          {wedstrijden.slice(0, 10).map((wedstrijd, i) => (
            <Pressable
              key={i}
              onPress={async (e) => {
                e.stopPropagation();

                setProgramLoading(true);
                setSelectedWedstrijd({ id: wedstrijd.id } as Wedstrijd);
                const w = await getWedstrijdData(wedstrijd);
                setProgramLoading(false);
                setSelectedWedstrijd(w);
                setModalShown(true);
              }}
              style={{
                display: "flex",
                flexDirection: "row",
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 5,
                marginHorizontal: 5,
                paddingVertical: 10,
                marginVertical: 5,
              }}
            >
              <Text
                style={{
                  ...textColor(colorScheme),
                  textAlign: "left",
                  flex: 1.5,
                }}
                numberOfLines={1}
              >
                {wedstrijd.name}
              </Text>
              {programLoading && selectedWedstrijd.id === wedstrijd.id && (
                <ActivityIndicator color="#ef8b22" />
              )}
              <Text
                style={{
                  ...textColor(colorScheme),
                  textAlign: "center",
                  flex: 1.5,
                }}
              >
                {wedstrijd.startDate.toLocaleDateString()}
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  textAlign: "right",
                  flex: 1.5,
                }}
              >
                {wedstrijd.location}
              </Text>
            </Pressable>
          ))}
        </SectionComponent>
      </Fragment>
    );
  } else return <ActivityIndicator color="#ef8b22" />;
}

function ClubrecordsComponent({
  clubrecords,
  colorScheme,
}: {
  clubrecords: { male: Clubrecord[]; female: Clubrecord[] };
  colorScheme: ColorSchemeName;
}) {
  const ages = [
    "onder 8",
    "onder 10",
    "onder 12",
    "onder 14",
    "onder 16",
    "onder 18",
    "onder 20",
    "Senioren",
  ];
  const [selected, setSelected] = useState("Mannen" as "Mannen" | "Vrouwen");
  const [selectedClubrecord, setSelectedClubrecord] = useState({
    distance: "",
    times: [],
    swimmers: [],
    event: "",
    dates: [],
    locations: [],
    meets: [],
  } as Clubrecord);
  if (!(clubrecords.male.length > 0)) {
    return <ActivityIndicator color="#ef8b22" size="small" />;
  }
  return (
    <Fragment>
      <Modal
        animationType="slide"
        visible={selectedClubrecord.distance.length > 0}
        transparent
        onRequestClose={() =>
          setSelectedClubrecord({ distance: "" } as Clubrecord)
        }
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
              height: 700,
              width: 400,
              padding: 20,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[
                  textColor(colorScheme),
                  { fontWeight: "bold", textAlign: "center", fontSize: 25 },
                ]}
              >
                {selectedClubrecord.distance} {selectedClubrecord.event}
              </Text>
              <View>
                {selectedClubrecord.times.map((time, index) => (
                  <View
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: 6,
                      borderColor: "grey",
                      borderWidth: 1,
                      margin: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={[
                        textColor(colorScheme),
                        { textTransform: "capitalize", flex: 1 },
                      ]}
                    >
                      {ages[index]}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "center" },
                        ]}
                      >
                        {time}
                      </Text>
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "center" },
                        ]}
                      >
                        {selectedClubrecord.swimmers[index]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <ButtonComponent
                marginVertical={10}
                paddingVertical={10}
                onPress={() =>
                  setSelectedClubrecord({
                    distance: "",
                    times: [],
                    swimmers: [],
                    event: "",
                    dates: [],
                    locations: [],
                    meets: [],
                  })
                }
              >
                <Text
                  style={[
                    textColor(colorScheme === "dark"),
                    { fontWeight: "bold" },
                  ]}
                >
                  Sluit
                </Text>
              </ButtonComponent>
            </View>
          </View>
        </View>
      </Modal>
      <SectionComponent title="Clubrecords">
        <View
          style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
        >
          <Dropdown
            style={{ borderColor: "#ef8b22" }}
            onPress={(item) => setSelected(item)}
            data={["Mannen", "Vrouwen"]}
            renderItem={({ item, index }) => (
              <Text
                style={{
                  ...textColor(colorScheme),
                  borderColor: "grey",
                  borderWidth: 1,
                  borderRadius: 6,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginVertical: 5,
                }}
              >
                {item}
              </Text>
            )}
          />
        </View>
        <View
          style={{
            borderColor: "#ef8b22",
            borderWidth: 1,
            padding: 10,
            borderRadius: 6,
          }}
        >
          <FlatList
            data={selected === "Mannen" ? clubrecords.male : clubrecords.female}
            style={{ height: 350 }}
            renderItem={({ item, index }) => (
              <Pressable
                key={index}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderColor: "grey",
                  borderWidth: 1,
                  borderRadius: 6,
                  marginVertical: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                onPress={() => setSelectedClubrecord(item)}
              >
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "25%",
                    textAlign: "left",
                  }}
                >
                  {item.distance} {item.event}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "35%",
                    textAlign: "center",
                  }}
                >
                  {
                    item.times[
                      item.times.findLastIndex(
                        (swimmer) => swimmer?.length && swimmer.length > 0
                      )
                    ]
                  }
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "30%",
                    textAlign: "center",
                  }}
                >
                  {
                    item.swimmers[
                      item.swimmers.findLastIndex(
                        (swimmer) => swimmer?.length && swimmer.length > 0
                      )
                    ]
                  }
                </Text>
              </Pressable>
            )}
          />
        </View>
      </SectionComponent>
    </Fragment>
  );
}
