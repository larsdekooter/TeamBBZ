import ButtonComponent from "@/components/ButtonComponent";
import CheckBox from "@/components/Checkbox";
import Dropdown from "@/components/Dropdown";
import Page from "@/components/Page";
import PbTable from "@/components/PbTable";
import SectionComponent from "@/components/SectionComponent";
import SwipeModal from "@/components/SwipeModal";
import TextInputComponent from "@/components/TextInputComponent";
import { Colors, Profile, SwimrakingEventId, Time } from "@/constants/enums";
import {
  convertTimestringToNumber,
  filterFastestFromArray,
  textColor,
} from "@/constants/functions";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import { Entypo, MaterialIcons, Octicons } from "@expo/vector-icons";
import { SQLiteStatement } from "expo-sqlite";
import { Fragment, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function Times() {
  const [profile, setProfile] = useState<Profile | null>({} as Profile);
  const [mainSwimmerSelected, setMainSwimmerSelected] = useState(true);
  const [timesInputted, setTimesInputted] = useState(false);
  const colorScheme = useColorScheme();
  const [inputTimeModalVisible, setInputTimeModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(
    !timesInputted ? Tabs.Input : Tabs.Pbs,
  );
  const [insertTimeStatement, setInsertTimeStatement] =
    useState<SQLiteStatement | null>(null);
  const [times, setTimes] = useState<Time[]>([]);

  useEffect(() => {
    const asyncer = async () => {
      const profile = await TeamBBZSQLite.db.getFirstAsync<Profile>(
        "SELECT * FROM profile",
      );
      const tms = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
      setTimes(tms);

      setProfile(profile);
      setTimesInputted(
        !!(await TeamBBZSQLite.db.getFirstAsync<Time>("SELECT * FROM times")),
      );
    };
    asyncer();
  }, []);

  if (profile) {
    return (
      <Page>
        <InputTimesModal
          onClose={() => setInputTimeModalVisible(false)}
          visible={inputTimeModalVisible}
          currentSwimmer={profile.username}
          insertTimesStatement={insertTimeStatement}
        />
        <TimesHeader
          profile={profile}
          mainSwimmerSelected={mainSwimmerSelected}
          timesInputted={timesInputted}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab === Tabs.Input && (
          <Fragment>
            <ButtonComponent
              onPress={async () => {
                setInputTimeModalVisible(true);
                setInsertTimeStatement(
                  await TeamBBZSQLite.db.prepareAsync(
                    "INSERT INTO times (event, time, poolSize, points, date, meet, location, swimmer) VALUES ($event, $time, $poolSize, $points, $date, $meet, $location, $swimmer)",
                  ),
                );
              }}
              style={{ width: "95%", paddingVertical: 10, marginVertical: 10 }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Voer tijden in
              </Text>
            </ButtonComponent>
            {!timesInputted && (
              <Text
                style={{
                  color: "grey",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Je moet ten minste 1 tijd invullen om verder te kunnen gaan!
              </Text>
            )}
          </Fragment>
        )}
        {activeTab === Tabs.Pbs && (
          <TimeTable
            times={times}
            profile={profile}
            mainSwimmerSelected={mainSwimmerSelected}
          />
        )}
      </Page>
    );
  } else return <Page></Page>;
}

function TimeTable({
  times,
  profile,
  mainSwimmerSelected,
}: {
  times: Time[];
  profile: Profile;
  mainSwimmerSelected: boolean;
}) {
  const strokes = {
    vlinderslag: times
      .filter(({ event }) => event.toLocaleLowerCase().includes("vlinderslag"))
      .filter(filterFastestFromArray),
    rugslag: times
      .filter(({ event }) => event.toLowerCase().includes("rugslag"))
      .filter(filterFastestFromArray),
    schoolslag: times
      .filter(({ event }) => event.toLowerCase().includes("schoolslag"))
      .filter(filterFastestFromArray),
    "vrije slag": times
      .filter(({ event }) => event.toLowerCase().includes("vrije slag"))
      .filter(filterFastestFromArray),
    wisselslag: times
      .filter(({ event }) => event.toLowerCase().includes("wisselslag"))
      .filter(filterFastestFromArray),
  };
  const colorScheme = useColorScheme();
  return (
    <Fragment>
      <View
        style={{
          minHeight: "83%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Object.keys(strokes).map((stroke) => (
          <SectionComponent
            title={stroke.charAt(0).toUpperCase() + stroke.slice(1)}
            bold
            containerStyle={{
              borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            }}
            key={stroke}
          >
            <FlatList
              data={strokes[stroke as keyof typeof strokes]}
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
                  }}
                >
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "left" },
                    ]}
                  >
                    {item.event}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "center" },
                    ]}
                  >
                    {item.time}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "right" },
                    ]}
                  >
                    {item.poolSize}
                  </Text>
                </Pressable>
              )}
            />
          </SectionComponent>
        ))}
      </View>
    </Fragment>
  );
}

function InputTimesModal({
  visible,
  onClose,
  currentSwimmer,
  insertTimesStatement,
}: {
  visible: boolean;
  onClose: () => void;
  currentSwimmer: string;
  insertTimesStatement: SQLiteStatement | null;
}) {
  const colorScheme = useColorScheme();
  const [selectedStroke, setSelectedStroke] = useState<
    "Vlinderslag" | "Rugslag" | "Schoolslag" | "Vrije Slag" | "Wisselslag"
  >("Vlinderslag");
  const [distance, setDistance] = useState<
    25 | 50 | 100 | 200 | 300 | 400 | 800 | 1500 | 2000
  >(25);
  const [timeObject, setTimeObject] = useState<Time>({
    poolSize: "25m",
    swimmer: currentSwimmer,
  } as Time);
  const [time, setTime] = useState<{ m: number; s: number; h: number }>({
    m: 0,
    s: 0,
    h: 0,
  });
  return (
    <SwipeModal
      visible={visible}
      onClose={async () => {
        await insertTimesStatement?.finalizeAsync();
        onClose();
        setSelectedStroke("Vlinderslag");
      }}
      height={Dimensions.get("window").height * 0.72}
    >
      <ScrollView>
        <Text
          style={[
            textColor(colorScheme),
            {
              fontSize: 25,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
            },
          ]}
        >
          Voer Tijd informatie in
        </Text>
        <View
          style={{
            justifyContent: "space-evenly",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Dropdown
            data={
              selectedStroke === "Vrije Slag"
                ? [
                    "25m",
                    "50m",
                    "100m",
                    "200m",
                    "400m",
                    "800m",
                    "1500m",
                    "2000m",
                  ]
                : selectedStroke === "Wisselslag"
                  ? ["100m", "200m", "300m", "400m"]
                  : ["25m", "50m", "100m", "200m"]
            }
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "35%" }}
            textStyle={{ width: "70%" }}
            closeWhenSelected
            onPress={(item) =>
              setDistance(
                parseInt(item) as
                  | 50
                  | 100
                  | 200
                  | 300
                  | 400
                  | 800
                  | 1500
                  | 2000,
              )
            }
          />
          <Dropdown
            data={[
              "Vlinderslag",
              "Rugslag",
              "Schoolslag",
              "Vrije Slag",
              "Wisselslag",
            ]}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "45%" }}
            textStyle={{ width: "82%" }}
            onPress={(item) => setSelectedStroke(item)}
            closeWhenSelected
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginVertical: 10,
            alignItems: "center",
            paddingHorizontal: 40,
            marginHorizontal: -30,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Tijd</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <TextInputComponent
              placeholder="m"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, m: parseInt(input) })}
            />
            <Text
              style={[
                textColor(colorScheme),
                { fontSize: 35, fontWeight: "bold" },
              ]}
            >
              :
            </Text>
            <TextInputComponent
              placeholder="s"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, s: parseInt(input) })}
            />
            <Text
              style={[
                textColor(colorScheme),
                { fontSize: 35, fontWeight: "bold" },
              ]}
            >
              .
            </Text>
            <TextInputComponent
              placeholder="h"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, h: parseInt(input) })}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
            marginHorizontal: -75,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Kort bad (25m)</Text>
          <CheckBox
            onPress={() =>
              setTimeObject({
                ...timeObject,
                poolSize: timeObject.poolSize === "25m" ? "50m" : "25m",
              })
            }
            checked={timeObject.poolSize === "25m"}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
            marginHorizontal: -75,
          }}
        >
          <Text style={[textColor(colorScheme)]}>FINA Punten</Text>
          <TextInputComponent
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, points: parseInt(input) })
            }
          />
        </View>
        <View
          style={{
            alignItems: "center",
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 25,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Zwemmer</Text>
          <TextInputComponent
            placeholder="Zwemmer"
            style={{ width: 150, textAlign: "center" }}
            value={currentSwimmer}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, swimmer: input })
            }
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Datum (dd-mm-yyyy)"
            style={{ width: 250, textAlign: "center" }}
            keyboardType="numeric"
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, date: input })
            }
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Wedstrijd"
            style={{ width: 250, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, meet: input })
            }
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Locatie"
            style={{ width: 250, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, location: input })
            }
          />
        </View>
        <ButtonComponent
          onPress={async () => {
            if (
              !timeObject.points ||
              !timeObject.poolSize ||
              (!timeObject.swimmer && !currentSwimmer) ||
              !time.h ||
              !time.s ||
              !insertTimesStatement
            )
              return console.log(
                !timeObject.points,
                !timeObject.poolSize,
                !timeObject.swimmer && !currentSwimmer,
                !time.h,
                !time.s,
                !insertTimesStatement,
              );

            try {
              await insertTimesStatement.executeAsync({
                $event: `${distance}m ${selectedStroke}`,
                $time: `${String(time.m || 0).padStart(2, "0")}:${String(time.s).padStart(2, "0")}.${String(time.h).padStart(2, "0")}`,
                $poolSize: timeObject.poolSize,
                $points: timeObject.points,
                $date: timeObject.date,
                $meet: timeObject.meet,
                $location: timeObject.location,
                $swimmer: timeObject.swimmer ?? currentSwimmer,
              } as any);
            } finally {
              await insertTimesStatement.finalizeAsync();
              onClose();
            }
          }}
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? Colors.ModalDarkBackground
                : Colors.ModalLightBackground,
            paddingVertical: 10,
            marginHorizontal: 20,
          }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Voer in
          </Text>
        </ButtonComponent>
      </ScrollView>
    </SwipeModal>
  );
}

enum Tabs {
  Input = 1,
  Pbs = 2,
  Records = 3,
  Meets = 4,
  Biografy = 5,
  Speciality = 6,
}

function TimesHeader({
  mainSwimmerSelected,
  profile,
  timesInputted,
  activeTab,
  setActiveTab,
}: {
  mainSwimmerSelected: boolean;
  profile: Profile;
  timesInputted: boolean;
  activeTab: Tabs;
  setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>;
}) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setActiveTab(!timesInputted ? Tabs.Input : Tabs.Pbs);
  }, [timesInputted]);
  return (
    <View
      style={{
        backgroundColor:
          colorScheme === "light" ? "#fff" : Colors.DarkBackground,
        zIndex: 2,
        height: 130,
        position: "absolute",
        top: 0,
      }}
    >
      <Pressable
        style={{
          width: "100%",
          paddingVertical: 5,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            flex: 1,
            width: "90%",
            marginVertical: 10,
            borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 20,
            paddingVertical: 5,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {profile.username}
            </Text>
            <Text style={[textColor(colorScheme)]}>{profile.birthdate}</Text>
          </View>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {profile.country}
            </Text>
            <Text style={[textColor(colorScheme)]}>{profile.club}</Text>
          </View>
        </View>
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "grey",
          width: Dimensions.get("window").width,
          flex: 1,
          justifyContent: "space-around",
          paddingBottom: 5,
        }}
      >
        <Fragment>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Input ? 2 : 1,
              borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            }}
            onPress={() => setActiveTab(Tabs.Input)}
          >
            <MaterialIcons
              name="input"
              color={textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Pbs ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() => (!timesInputted ? null : setActiveTab(Tabs.Pbs))}
          >
            <Octicons
              name="stopwatch"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Speciality ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() =>
              !timesInputted ? null : setActiveTab(Tabs.Speciality)
            }
          >
            <Octicons
              name="star"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
        </Fragment>
      </View>
    </View>
  );
}
