class Person {
    constructor(age, bmi, sleep, smoke) {
        this.age = age;
        this.bmi = bmi;
        this.sleep = sleep;
        this.smoke = smoke;
    }

    isMatchingRow(row) {
        return (
            (row.AGE >= this.age) &&
            (row.BMI === this.bmi) &&
            (row.SLEEP === this.sleep) &&
            (row.SMOKE === this.smoke)
        );
    }

    // Filter data from the large dataset
    getData(data_raw, topic) {
        let data_filtered = data_raw.filter(d => this.isMatchingRow(d));
        for (let row of data_filtered) {
            row['TOPIC'] = topic;
        }
        return data_filtered;
    }

    // Test if the Person is valid for intervention
    isValidForBmiIntervention() { return this.bmi !== 1; }
    isValidForSleepIntervention() { return this.sleep === 0; }
    isValidForSmokeIntervention() { return this.smoke !== 0; }

    // Apply intervention, return a new Person instance after applying the intervention
    applyBmiIntervention() {
        return new Person(this.age, 1, this.sleep, this.smoke);
    }
    applySleepIntervention() {
        return new Person(this.age, this.bmi, 1, this.smoke);
    }
    applySmokeIntervention(data_raw) {
        return new Person(this.age, this.bmi, this.sleep, 0);
    }

    // Get all data including interventions for the person
    getAllData(data_raw) {
        let all_data = {"Base": this.getData(data_raw, "Base")};
        if (this.isValidForBmiIntervention()) {
            const topic = "Limit BMI to 18.5 to 25";
            all_data[topic] = this.applyBmiIntervention().getData(data_raw, topic);
        }
        if (this.isValidForSleepIntervention()) {
            const topic = "Sleep for 7 to 9 hours per day";
            all_data[topic] = this.applySleepIntervention().getData(data_raw, topic);
        }
        if (this.isValidForSmokeIntervention()) {
            const topic = "Quit smoking";
            all_data[topic] = this.applySmokeIntervention().getData(data_raw, topic);
        }
        return all_data;
    }

    // Statical method, return the real age on age value
    static getRealAge(age) { return 20 + 10 * age; }
}