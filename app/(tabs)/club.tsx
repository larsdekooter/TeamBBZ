import ButtonComponent from "@/components/ButtonComponent";
import Page from "@/components/Page";
import {
  enterMeet,
  getClubRecords,
  getCompetitieStand,
  getMeetCalendar,
  getSchemaData,
  getWedstrijdData,
  textColor,
} from "@/constants/functions";
import { Clubrecord, CompetitieStand, Wedstrijd } from "@/constants/types";
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
  FlatList,
} from "react-native";
import SectionComponent from "@/components/SectionComponent";
import Dropdown from "@/components/Dropdown";
import SwipeModal from "@/components/SwipeModal";
import { ScrollView } from "react-native-gesture-handler";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function Club() {
  const [schema, setSchema] = useState(
    {} as { schema: string; groups: string[] }
  );
  const [wedstrijden, setWedstrijden] = useState([] as Wedstrijd[]);
  const [clubrecords, setClubrecords] = useState({ male: [], female: [] } as {
    male: Clubrecord[];
    female: Clubrecord[];
  });
  const [competitieStanden, setCompetitieStanden] = useState(
    [] as CompetitieStand[]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getS = async () => {
      const schem = await getSchemaData();
      const wden = await getMeetCalendar();
      const crs = await getClubRecords();
      const compStanden = await getCompetitieStand();
      setSchema(schem);
      setWedstrijden(wden);
      setClubrecords(crs);
      setCompetitieStanden(compStanden);
      setLoading(false);
    };
    if (loading) {
      getS();
    }
  }, []);

  const colorScheme = useColorScheme();

  return (
    <Page>
      <SchemaComponent
        colorScheme={colorScheme}
        schema={schema}
        loading={loading}
      />
      <WedstrijdenComponent
        colorScheme={colorScheme}
        wedstrijden={wedstrijden}
        loading={loading}
      />
      <ClubrecordsComponent
        colorScheme={colorScheme}
        clubrecords={clubrecords}
        loading={loading}
      />
      <CompetitieStandComponent
        colorScheme={colorScheme}
        competitieStanden={competitieStanden}
        loading={loading}
      />
    </Page>
  );
}

function CompetitieStandComponent({
  colorScheme,
  competitieStanden,
  loading,
}: {
  colorScheme: ColorSchemeName;
  competitieStanden: CompetitieStand[];
  loading?: boolean;
}) {
  const [selected, setSelected] = useState({} as CompetitieStand);
  const [position, setPosition] = useState(0);
  const huidigePlek =
    competitieStanden
      .sort((a, b) => a.total - b.total)
      .findIndex(({ team }) => team === "De Biesboschzwemmers") + 1;

  return (
    <Fragment>
      <SwipeModal
        visible={selected.team?.length > 1}
        onClose={() => {
          setSelected({} as CompetitieStand);
          setPosition(0);
        }}
      >
        <View style={{ width: "100%", flex: 1 }}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <Text
              style={[
                textColor(colorScheme),
                { flex: 1, fontWeight: "bold", textAlign: "left" },
              ]}
            >
              {selected.team}
            </Text>
            <Text
              style={[
                textColor(colorScheme),
                { flex: 1, fontWeight: "bold", textAlign: "center" },
              ]}
            >
              {position}
            </Text>
            <Text
              style={[
                textColor(colorScheme),
                { flex: 1, fontWeight: "bold", textAlign: "right" },
              ]}
            >
              {selected.total}
            </Text>
          </View>
          <View
            style={{
              padding: 10,
              marginHorizontal: 20,
              borderColor: "grey",
              borderWidth: 1,
              borderRadius: 6,
            }}
          >
            <FlatList
              style={{
                maxHeight: 300,
              }}
              data={["Ronde 1", "Ronde 2", "Ronde 3", "Ronde 4", "Ronde 5"]}
              renderItem={({ item, index }) => {
                const roundName = `round${index + 1}` as
                  | "round1"
                  | "round2"
                  | "round3"
                  | "round4"
                  | "round5";
                const points = selected[roundName];
                const competitieStandenIndexRound = competitieStanden
                  .map((stand) => stand[roundName]) // Map the competitie standen to the round we are working on based on the index
                  .sort((a, b) => a - b);
                const position =
                  points === 0
                    ? ""
                    : competitieStandenIndexRound.indexOf(points) + 1;
                return (
                  <View
                    key={index}
                    style={{
                      borderColor: "#ef8b22",
                      borderWidth: 1,
                      borderRadius: 6,
                      padding: 5,
                      marginVertical: 5,
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={[
                        textColor(colorScheme),
                        { textAlign: "left", flex: 1 },
                      ]}
                    >
                      {item}
                    </Text>
                    <Text
                      style={[
                        textColor(colorScheme),
                        { textAlign: "center", flex: 1 },
                      ]}
                    >
                      {position}
                    </Text>
                    <Text
                      style={[
                        textColor(colorScheme),
                        { textAlign: "right", flex: 1 },
                      ]}
                    >
                      {points}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </SwipeModal>

      <SectionComponent
        title={`Competitie stand (${huidigePlek})`}
        loading={loading}
      >
        <FlatList
          data={competitieStanden.sort((a, b) => a.total - b.total)}
          style={{ height: 350 }}
          renderItem={({ item, index }) => (
            <Pressable
              style={{
                margin: 5,
                paddingVertical: 5,
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                setSelected(item);
                setPosition(index + 1);
              }}
            >
              <Text
                style={[textColor(colorScheme), { textAlign: "left", flex: 2 }]}
              >
                {item.team}
              </Text>
              <Text
                style={[
                  textColor(colorScheme),
                  { textAlign: "center", flex: 1 },
                ]}
              >
                {index + 1}
              </Text>
              <Text
                style={[
                  textColor(colorScheme),
                  { textAlign: "right", flex: 1 },
                ]}
              >
                {item.total}
              </Text>
            </Pressable>
          )}
        />
      </SectionComponent>
    </Fragment>
  );
}

function SchemaComponent({
  schema,
  colorScheme,
  loading,
}: {
  schema: {
    schema:
      | "Geen schema vandaag!"
      | "Schema bekijken niet toegestaan"
      | "Geen trainen vandaag!"
      | string;
    groups: string[];
  };
  colorScheme: ColorSchemeName;
  loading?: boolean;
}) {
  const currentDate = new Date();
  const [shown, setShown] = useState(false);
  const [height, setHeight] = useState(0);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const [schemaState, setSchemaState] = useState(schema);
  useEffect(() => {
    setSchemaState(schema);
  }, [schema]);
  const toggleExpand = () => {
    setShown(!shown);
    Animated.timing(rotateAnim, {
      toValue: shown ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <Fragment>
      <SwipeModal
        visible={shown}
        onClose={toggleExpand}
        height={height > 100 ? height + 150 : 200}
        closeValue={200}
        onRequestClose={toggleExpand}
      >
        <ScrollView style={{ width: "100%" }}>
          {![
            "Geen schema vandaag!",
            "Schema bekijken niet toegestaan",
            "Geen trainen vandaag!",
          ].includes(schemaState.schema) && (
            <Dropdown
              data={schema.groups}
              style={{ width: "100%" }}
              closeWhenSelected
              onPress={async (item) => {
                setSchemaState(await getSchemaData(item));
              }}
              renderItem={({ item }) => (
                <Text
                  style={[
                    textColor(colorScheme),
                    {
                      borderWidth: 1,
                      borderColor: "grey",
                      margin: 5,
                      paddingVertical: 10,
                      paddingHorizontal: 5,
                      borderRadius: 8,
                      textAlign: "center",
                    },
                  ]}
                >
                  {item}
                </Text>
              )}
            />
          )}
          <Text
            style={[textColor(colorScheme), { width: "100%" }]}
            onTextLayout={(event) => {
              const { lines } = event.nativeEvent;
              if (lines.length > 0) {
                setHeight(
                  lines[0].height * lines.length +
                    (![
                      "Geen schema vandaag!",
                      "Schema bekijken niet toegestaan",
                      "Geen trainen vandaag!",
                    ].includes(schemaState.schema)
                      ? 50
                      : 0)
                );
              }
            }}
          >
            {!schemaState.schema
              ? null
              : schemaState.schema.replace("\r", "\n")}
          </Text>
        </ScrollView>
      </SwipeModal>
      <Pressable
        style={{
          width: Dimensions.get("window").width * 0.95,
          borderColor: "#ef8b22",
          borderWidth: 1,
          borderRadius: 6,
          paddingVertical: 10,
          paddingHorizontal: 20,
          overflow: "hidden",
          marginVertical: 10,
        }}
        onPress={toggleExpand}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[textColor(colorScheme)]}>
            Schema van {currentDate.getDate()}-{currentDate.getMonth() + 1}-
            {currentDate.getFullYear()}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <FontAwesome
              name="chevron-down"
              size={15}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </Animated.View>
        </View>
      </Pressable>
    </Fragment>
  );
}

function WedstrijdenComponent({
  colorScheme,
  wedstrijden,
  loading,
}: {
  colorScheme: ColorSchemeName;
  wedstrijden: Wedstrijd[];
  loading?: boolean;
}) {
  const [modalShown, setModalShown] = useState(false);
  const [selectedWedstrijd, setSelectedWedstrijd] = useState({} as Wedstrijd);
  const [programLoading, setProgramLoading] = useState(false);
  const [chosenProgram, setChosenProgram] = useState([] as number[]);
  const [inschrijfLoading, setInschrijfLoading] = useState(false);

  return (
    <Fragment>
      <SwipeModal
        visible={modalShown}
        onClose={() => {
          setModalShown(false);
          setChosenProgram([]);
        }}
        height={
          selectedWedstrijd.program
            ? Dimensions.get("window").height * 0.9
            : 180
        }
      >
        <View
          style={{
            borderColor: "#ef8b22",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 20,
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            paddingVertical: 5,
          }}
        >
          <View>
            <Text
              style={[
                textColor(colorScheme),
                {
                  fontWeight: "bold",
                  overflow: "hidden",
                  maxWidth: "60%",
                },
              ]}
              numberOfLines={1}
            >
              {selectedWedstrijd.name}
            </Text>
            <Text style={[textColor(colorScheme)]}>
              {selectedWedstrijd.location}
            </Text>
          </View>
          <View>
            <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
              {selectedWedstrijd.startDate?.toLocaleString()}
            </Text>
            <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
              {selectedWedstrijd.category}
            </Text>
          </View>
        </View>
        {selectedWedstrijd.enterable && (
          <ButtonComponent
            onPress={async () => {
              setInschrijfLoading(true);
              await enterMeet(selectedWedstrijd, chosenProgram);
              setInschrijfLoading(false);
              setModalShown(false);
            }}
            style={{
              width: "50%",
              paddingVertical: 10,
              marginBottom: 5,
              marginTop: 10,
              backgroundColor: "#2a3140",
            }}
          >
            <Text style={[textColor(colorScheme)]}>Schrijf in</Text>
          </ButtonComponent>
        )}
        {selectedWedstrijd.program && (
          <FlatList
            data={selectedWedstrijd.program.filter(
              (p) => !selectedWedstrijd.enterable || !p.name.includes("pauze")
            )}
            style={{
              width: "100%",
            }}
            renderItem={({ item }) => {
              if (selectedWedstrijd.enterable) {
                return (
                  <Pressable
                    style={{
                      backgroundColor: !chosenProgram.includes(
                        parseInt(item.name.split(/\s/)[0])
                      )
                        ? colorScheme === "dark"
                          ? "#2a3137"
                          : "#d6d6d6"
                        : "#133914",
                      margin: 5,
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
                        : "#ef8b22",
                      borderWidth: 1,
                    }}
                    onPress={() => {
                      const programNumber = parseInt(item.name.split(/\s/)[0]);
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
                          ? colorScheme === "dark"
                            ? "#2a3137"
                            : "#fff"
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
                );
              } else {
                return <View></View>;
              }
            }}
          />
        )}
      </SwipeModal>
      <SectionComponent title="Wedstrijden" loading={loading}>
        <FlatList
          data={wedstrijden.slice(0, 10)}
          style={{ maxHeight: 400 }}
          renderItem={({ item: wedstrijd, index: i }) => (
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
          )}
        />
      </SectionComponent>
    </Fragment>
  );
}

function ClubrecordsComponent({
  clubrecords,
  colorScheme,
  loading,
}: {
  clubrecords: { male: Clubrecord[]; female: Clubrecord[] };
  colorScheme: ColorSchemeName;
  loading?: boolean;
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

  return (
    <Fragment>
      <SwipeModal
        visible={selectedClubrecord.distance.length > 0}
        onRequestClose={() =>
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
        onClose={() =>
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
        height={700}
        closeValue={200}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
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
                    style={[textColor(colorScheme), { textAlign: "center" }]}
                  >
                    {time ?? "-.--.--"}
                  </Text>
                  <Text
                    style={[textColor(colorScheme), { textAlign: "center" }]}
                  >
                    {selectedClubrecord.swimmers[index] ?? "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </SwipeModal>
      <SectionComponent title="Clubrecords" loading={loading}>
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
